import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
  HttpException,
} from '@nestjs/common';
import { AdminDeviceRepository } from './device.repository';
import { AdminDeviceGameRepository } from './device-game.repository';
import { AdminBranchRepository } from '../branch/branch.repository';
import { AdminShopRepository } from '../shop/shop.repository';
import { UploadService } from '../../../upload/upload.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';

@Injectable()
export class AdminDeviceService {
  private readonly logger = new Logger(AdminDeviceService.name);

  constructor(
    private readonly deviceRepository: AdminDeviceRepository,
    private readonly deviceGameRepository: AdminDeviceGameRepository,
    private readonly branchRepository: AdminBranchRepository,
    private readonly shopRepository: AdminShopRepository,
    private readonly uploadService: UploadService,
  ) {}

  // ─── Private Helpers ────────────────────────────────────────────────────────

  private async resolveImageUrl(file?: Express.Multer.File): Promise<string | undefined> {
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
  }

  private async findDeviceOrFail(id: string) {
    const device = await this.deviceRepository.findById(id);
    if (!device) throw new NotFoundException('Device not found');
    return device;
  }

  // ─── Public Methods ──────────────────────────────────────────────────────────

  async createDevice(shopId: string, branchId: string, dto: CreateDeviceDto, file?: Express.Multer.File) {
    try {
      await this.validateShopAndBranch(shopId, branchId);
      const imageUrl = await this.resolveImageUrl(file);

      const device = await this.deviceRepository.create({
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

      if (dto.gameIds?.length) {
        await this.deviceGameRepository.replaceGames(device.id, dto.gameIds);
      }

      return device;
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

      return { data: devices, total, page, limit, totalPages: Math.ceil(total / limit) };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed to list devices for branch ${branchId}`, error instanceof Error ? error.stack : error);
      throw new InternalServerErrorException('Failed to list devices');
    }
  }

  async getDevice(id: string) {
    try {
      return await this.findDeviceOrFail(id);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed to get device ${id}`, error instanceof Error ? error.stack : error);
      throw new InternalServerErrorException('Failed to get device');
    }
  }

  async updateDevice(id: string, dto: UpdateDeviceDto, file?: Express.Multer.File) {
    try {
      await this.findDeviceOrFail(id);
      const imageUrl = await this.resolveImageUrl(file);
      const { gameIds, ...fields } = dto;

      if (gameIds !== undefined) {
        await this.deviceGameRepository.replaceGames(id, gameIds);
      }

      return await this.deviceRepository.update(id, {
        ...fields,
        ...(imageUrl && { imageUrl }),
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed to update device ${id}`, error instanceof Error ? error.stack : error);
      throw new InternalServerErrorException('Failed to update device');
    }
  }

  async deleteDevice(id: string) {
    try {
      await this.findDeviceOrFail(id);
      return await this.deviceRepository.delete(id);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed to delete device ${id}`, error instanceof Error ? error.stack : error);
      throw new InternalServerErrorException('Failed to delete device');
    }
  }
}
