import { Injectable, NotFoundException, ForbiddenException, InternalServerErrorException, Logger, HttpException } from '@nestjs/common';
import { ShopAdminShopRepository } from './shop.repository';
import { UploadService } from '../../../upload/upload.service';
import { ShopAdminUpdateShopDto } from './dto/update-shop.dto';

@Injectable()
export class ShopAdminShopService {
  private readonly logger = new Logger(ShopAdminShopService.name);

  constructor(
    private readonly shopRepository: ShopAdminShopRepository,
    private readonly uploadService: UploadService,
  ) {}

  async getMyShop(ownerId: number) {
    try {
      const shop = await this.shopRepository.findByOwnerId(ownerId);
      if (!shop) throw new NotFoundException('Shop not found');
      if (shop.isBlocked) throw new ForbiddenException('Your shop has been blocked');
      return shop;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed to get shop for owner ${ownerId}`, error instanceof Error ? error.stack : error);
      throw new InternalServerErrorException('Failed to get shop');
    }
  }

  async updateMyShop(ownerId: number, dto: ShopAdminUpdateShopDto, logo?: Express.Multer.File) {
    try {
      const shop = await this.getMyShop(ownerId);

      let logoUrl: string | undefined;
      if (logo) logoUrl = await this.uploadService.uploadImage('shop/logo/', logo);

      return await this.shopRepository.update(ownerId, {
        ...dto,
        ...(logoUrl && { logoUrl }),
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed to update shop for owner ${ownerId}`, error instanceof Error ? error.stack : error);
      throw new InternalServerErrorException('Failed to update shop');
    }
  }
}
