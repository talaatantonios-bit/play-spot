import { Injectable, NotFoundException, ForbiddenException, InternalServerErrorException, Logger, HttpException } from '@nestjs/common';
import { ShopAdminRepository } from './repositories/shopadmin.repository';
import { UpdateMyShopDto } from './dto/update-my-shop.dto';

@Injectable()
export class ShopAdminService {
  private readonly logger = new Logger(ShopAdminService.name);

  constructor(private readonly shopAdminRepository: ShopAdminRepository) {}

  async getMyShop(ownerId: number) {
    try {
      const shop = await this.shopAdminRepository.findByOwnerId(ownerId);
      if (!shop) throw new NotFoundException('Shop not found');
      if (shop.isBlocked) throw new ForbiddenException('Your shop has been blocked');
      return shop;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed to get shop for owner ${ownerId}`, error instanceof Error ? error.stack : error);
      throw new InternalServerErrorException('Failed to get shop');
    }
  }

  async updateMyShop(ownerId: number, dto: UpdateMyShopDto) {
    try {
      await this.getMyShop(ownerId);
      return await this.shopAdminRepository.update(ownerId, dto);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed to update shop for owner ${ownerId}`, error instanceof Error ? error.stack : error);
      throw new InternalServerErrorException('Failed to update shop');
    }
  }
}
