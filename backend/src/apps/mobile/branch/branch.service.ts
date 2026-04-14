import { Injectable, NotFoundException, InternalServerErrorException, Logger, HttpException } from '@nestjs/common';
import { MobileBranchRepository } from './repositories/branch.repository';
import { MobileDeviceRepository } from './repositories/device.repository';
import { BranchQueryDto } from './dto/branch-query.dto';
import { PaginatedBranchResponse } from './responses/paginated-branch.response';
import { MobileBranchResponse } from './responses/branch.response';

function getBranchStatus(operatingHours: any): 'open' | 'close' {
  if (!operatingHours) return 'close';

  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const now = new Date();
  const dayName = daysOfWeek[now.getDay()];
  const todayHours = operatingHours[dayName];

  if (!todayHours || !todayHours.open || !todayHours.close) return 'close';

  const [openHour, openMinute] = todayHours.open.split(':').map(Number);
  const [closeHour, closeMinute] = todayHours.close.split(':').map(Number);

  const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
  const openTotalMinutes = openHour * 60 + openMinute;
  const closeTotalMinutes = closeHour * 60 + closeMinute;

  // Handle case where closing time is past midnight
  if (closeTotalMinutes < openTotalMinutes) {
    if (currentTotalMinutes >= openTotalMinutes || currentTotalMinutes <= closeTotalMinutes) {
      return 'open';
    }
    return 'close';
  }

  if (currentTotalMinutes >= openTotalMinutes && currentTotalMinutes <= closeTotalMinutes) {
    return 'open';
  }

  return 'close';
}

@Injectable()
export class MobileBranchService {
  private readonly logger = new Logger(MobileBranchService.name);

  constructor(
    private readonly branchRepository: MobileBranchRepository,
    private readonly deviceRepository: MobileDeviceRepository,
  ) {}

  async findByShop(query: BranchQueryDto): Promise<PaginatedBranchResponse> {
    try {
      const page = query.page ?? 1;
      const limit = query.limit ?? 10;
      const skip = (page - 1) * limit;

      const [branches, total] = await this.branchRepository.findActiveByShop({
        shopId: query.shopId,
        skip,
        take: limit,
        area: query.area,
      });

      const data = branches.map((branch) => {
        const branchData = branch as any;
        return {
          ...branchData,
          status: getBranchStatus(branchData.operatingHours),
        };
      }) as MobileBranchResponse[];

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed to fetch branches for shop ${query.shopId}`, error instanceof Error ? error.stack : error);
      throw new InternalServerErrorException('Failed to fetch branches');
    }
  }

  async findById(id: string): Promise<MobileBranchResponse> {
    try {
      const branch = await this.branchRepository.findById(id);
      if (!branch || !branch.isActive) throw new NotFoundException('Branch not found');
      
      const branchData = branch as any;
      return {
        ...branchData,
        status: getBranchStatus(branchData.operatingHours),
      } as MobileBranchResponse;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed to fetch branch ${id}`, error instanceof Error ? error.stack : error);
      throw new InternalServerErrorException('Failed to fetch branch');
    }
  }

  async findBranchDevices(branchId: string) {
    try {
      const branch = await this.branchRepository.findById(branchId);
      if (!branch || !branch.isActive) throw new NotFoundException('Branch not found');

      const devices = await this.deviceRepository.findAllByBranch(branchId);
      return { data: devices, total: devices.length };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        `Failed to fetch devices for branch ${branchId}`,
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException('Failed to fetch devices');
    }
  }

  async findDeviceWithGames(branchId: string, deviceId: string) {
    try {
      const branch = await this.branchRepository.findById(branchId);
      if (!branch || !branch.isActive) throw new NotFoundException('Branch not found');

      const device = await this.deviceRepository.findByIdWithGames(branchId, deviceId);
      if (!device) throw new NotFoundException('Device not found');

      const { games: deviceGames, ...deviceInfo } = device;
      return {
        ...deviceInfo,
        games: deviceGames
          .filter((dg) => dg.game.isActive)
          .sort((a, b) => a.game.displayOrder - b.game.displayOrder)
          .map((dg) => dg.game),
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        `Failed to fetch device ${deviceId} for branch ${branchId}`,
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException('Failed to fetch device');
    }
  }
}
