import { Injectable, NotFoundException, InternalServerErrorException, Logger, HttpException } from '@nestjs/common';
import { MobileShopRepository } from './repositories/shop.repository';

@Injectable()
export class MobileShopService {
  private readonly logger = new Logger(MobileShopService.name);

  constructor(private readonly shopRepository: MobileShopRepository) {}

  async findAll(page: number, limit: number) {
    try {
      const skip = (page - 1) * limit;
      const [shops, total] = await this.shopRepository.findAll(skip, limit);
      return { data: shops, total, page, limit, totalPages: Math.ceil(total / limit) };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error('Failed to fetch shops', error instanceof Error ? error.stack : error);
      throw new InternalServerErrorException('Failed to fetch shops');
    }
  }

  async findById(id: string) {
    try {
      const shop = await this.shopRepository.findById(id);
      if (!shop || !shop.isActive || shop.isBlocked) throw new NotFoundException('Shop not found');
      return shop;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed to fetch shop ${id}`, error instanceof Error ? error.stack : error);
      throw new InternalServerErrorException('Failed to fetch shop');
    }
  }
}
