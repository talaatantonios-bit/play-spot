import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
  HttpException,
} from '@nestjs/common';
import { AdminDeviceRepository } from './device.repository';
import { AdminBranchRepository } from '../branch/branch.repository';
import { AdminShopRepository } from '../shop/shop.repository';
import { UploadService } from '../../../upload/upload.service';
import { CreateDeviceDto } from './dto/create-device.dto';

@Injectable()
export class AdminDeviceService {
  private readonly logger = new Logger(AdminDeviceService.name);

  constructor(
    private readonly deviceRepository: AdminDeviceRepository,
    private readonly branchRepository: AdminBranchRepository,
    private readonly shopRepository: AdminShopRepository,
    private readonly uploadService: UploadService,
  ) {}

  // ─── Private Helpers ────────────────────────────────────────────────────────

  private async uploadDeviceImage(file?: Express.Multer.File): Promise<string | undefined> {
    if (!file) return undefined;
    return this.uploadService.uploadImage('device/', file);
  }

  private async validateShopAndBranch(shopId: string, branchId: string) {
    const shop = await this.shopRepository.findById(shopId);
    if (!shop) throw new NotFoundException('Shop not found');

    const branch = await this.branchRepository.findById(branchId);
    if (!branch) throw new NotFoundException('Branch not found');

    if (branch.shopId !== shopId) {
      throw new NotFoundException('Branch does not belong to this shop');
    }

    return { shop, branch };
  }

  // ─── Public Methods ──────────────────────────────────────────────────────────

  async createDevice(
    shopId: string,
    branchId: string,
    dto: CreateDeviceDto,
    file?: Express.Multer.File,
  ) {
    try {
      await this.validateShopAndBranch(shopId, branchId);

      const imageUrl = await this.uploadDeviceImage(file);

      return await this.deviceRepository.create({
        name: dto.name,
        deviceNumber: dto.deviceNumber,
        deviceType: dto.deviceType,
        roomHourlyPrice: dto.roomHourlyPrice,
        singleHourlyPrice: dto.singleHourlyPrice,
        multiplayerHourlyPrice: dto.multiplayerHourlyPrice,
        isVipRoom: dto.isVipRoom ?? false,
        maxPlayers: dto.maxPlayers ?? 1,
        displayOrder: dto.displayOrder ?? 0,
        ...(imageUrl && { imageUrl }),
        shop: { connect: { id: shopId } },
        branch: { connect: { id: branchId } },
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error('Failed to create device', error instanceof Error ? error.stack : error);
      throw new InternalServerErrorException('Failed to create device');
    }
  }

  async listDevices(branchId: string, page: number, limit: number) {
    try {
      const branch = await this.branchRepository.findById(branchId);
      if (!branch) throw new NotFoundException('Branch not found');

      const skip = (page - 1) * limit;
      const [devices, total] = await this.deviceRepository.findAllByBranch(branchId, skip, limit);

      return {
        data: devices,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        `Failed to list devices for branch ${branchId}`,
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException('Failed to list devices');
    }
  }

  async getDevice(id: string) {
    try {
      const device = await this.deviceRepository.findById(id);
      if (!device) throw new NotFoundException('Device not found');
      return device;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed to get device ${id}`, error instanceof Error ? error.stack : error);
      throw new InternalServerErrorException('Failed to get device');
    }
  }

  async deleteDevice(id: string) {
    try {
      const device = await this.deviceRepository.findById(id);
      if (!device) throw new NotFoundException('Device not found');
      return await this.deviceRepository.delete(id);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        `Failed to delete device ${id}`,
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException('Failed to delete device');
    }
  }
}
