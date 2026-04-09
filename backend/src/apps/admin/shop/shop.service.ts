import { Injectable, NotFoundException, ConflictException, BadRequestException, InternalServerErrorException, Logger, HttpException } from '@nestjs/common';
import { AdminShopRepository } from './shop.repository';
import { UserRepository } from '../../mobile/users/repositories/user.repository';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { BlockShopDto } from './dto/block-shop.dto';
import { ListShopsQueryDto } from './dto/list-shops-query.dto';
import { Role } from '../../../enums/role.enum';

@Injectable()
export class AdminShopService {
  private readonly logger = new Logger(AdminShopService.name);

  constructor(
    private readonly shopRepository: AdminShopRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async createShop(dto: CreateShopDto, createdBy: string) {
    try {
      const owner = await this.userRepository.findById(dto.ownerId);
      if (!owner) throw new NotFoundException('Owner user not found');
      if (owner.role !== Role.SHOP_ADMIN) throw new BadRequestException('Owner must have SHOP_ADMIN role');

      const existing = await this.shopRepository.findByOwnerId(dto.ownerId);
      if (existing) throw new ConflictException('This user already owns a shop');

      return await this.shopRepository.create({
        name: dto.name,
        description: dto.description,
        phoneNumber: dto.phoneNumber,
        subscriptionStatus: dto.subscriptionStatus,
        subscriptionPlan: dto.subscriptionPlan,
        subscriptionStart: dto.subscriptionStart ? new Date(dto.subscriptionStart) : undefined,
        subscriptionEnd: dto.subscriptionEnd ? new Date(dto.subscriptionEnd) : undefined,
        totalBranches: dto.totalBranches ?? 0,
        totalDevices: dto.totalDevices ?? 0,
        owner: { connect: { id: dto.ownerId } },
        ownerEmail: owner.email,
        createdBy,
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error('Failed to create shop', error instanceof Error ? error.stack : error);
      throw new InternalServerErrorException('Failed to create shop');
    }
  }

  async listShops(query: ListShopsQueryDto) {
    try {
      const page = query.page ?? 1;
      const limit = query.limit ?? 10;
      const skip = (page - 1) * limit;

      const [shops, total] = await this.shopRepository.findAll({
        skip,
        take: limit,
        search: query.search,
        subscriptionStatus: query.subscriptionStatus,
        isActive: query.isActive,
        isBlocked: query.isBlocked,
      });

      return { data: shops, total, page, limit, totalPages: Math.ceil(total / limit) };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error('Failed to list shops', error instanceof Error ? error.stack : error);
      throw new InternalServerErrorException('Failed to list shops');
    }
  }

  async getShop(id: string) {
    try {
      const shop = await this.shopRepository.findById(id);
      if (!shop) throw new NotFoundException('Shop not found');
      return shop;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed to get shop ${id}`, error instanceof Error ? error.stack : error);
      throw new InternalServerErrorException('Failed to get shop');
    }
  }

  async updateShop(id: string, dto: UpdateShopDto) {
    try {
      await this.getShop(id);
      return await this.shopRepository.update(id, {
        ...dto,
        subscriptionStart: dto.subscriptionStart ? new Date(dto.subscriptionStart) : undefined,
        subscriptionEnd: dto.subscriptionEnd ? new Date(dto.subscriptionEnd) : undefined,
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed to update shop ${id}`, error instanceof Error ? error.stack : error);
      throw new InternalServerErrorException('Failed to update shop');
    }
  }

  async blockShop(id: string, dto: BlockShopDto) {
    try {
      await this.getShop(id);
      return await this.shopRepository.update(id, { isBlocked: true, blockedReason: dto.reason ?? null });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed to block shop ${id}`, error instanceof Error ? error.stack : error);
      throw new InternalServerErrorException('Failed to block shop');
    }
  }

  async unblockShop(id: string) {
    try {
      await this.getShop(id);
      return await this.shopRepository.update(id, { isBlocked: false, blockedReason: null });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed to unblock shop ${id}`, error instanceof Error ? error.stack : error);
      throw new InternalServerErrorException('Failed to unblock shop');
    }
  }
}
