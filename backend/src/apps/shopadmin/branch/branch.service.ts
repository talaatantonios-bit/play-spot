import { Injectable, NotFoundException, ForbiddenException, InternalServerErrorException, Logger, HttpException } from '@nestjs/common';
import { ShopAdminBranchRepository } from './branch.repository';
import { ShopAdminShopRepository } from '../shop/shop.repository';
import { UploadService } from '../../../upload/upload.service';
import { ShopAdminCreateBranchDto } from './dto/create-branch.dto';
import { ShopAdminUpdateBranchDto } from './dto/update-branch.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ShopAdminBranchService {
  private readonly logger = new Logger(ShopAdminBranchService.name);

  constructor(
    private readonly branchRepository: ShopAdminBranchRepository,
    private readonly shopRepository: ShopAdminShopRepository,
    private readonly uploadService: UploadService,
  ) {}

  // Resolves the shop and verifies ownership + not blocked
  private async resolveShop(ownerId: number) {
    const shop = await this.shopRepository.findByOwnerId(ownerId);
    if (!shop) throw new NotFoundException('Shop not found');
    if (shop.isBlocked) throw new ForbiddenException('Your shop has been blocked');
    return shop;
  }

  // Verifies a branch belongs to the owner's shop
  private async resolveBranch(branchId: string, ownerId: number) {
    const shop = await this.resolveShop(ownerId);
    const branch = await this.branchRepository.findById(branchId);
    if (!branch || branch.shopId !== shop.id) throw new NotFoundException('Branch not found');
    return branch;
  }

  async createBranch(ownerId: number, dto: ShopAdminCreateBranchDto, file?: Express.Multer.File) {
    try {
      const shop = await this.resolveShop(ownerId);

      let imageUrl: string | undefined;
      if (file) imageUrl = await this.uploadService.uploadImage('branch/', file);

      let operatingHours: Prisma.InputJsonValue | typeof Prisma.JsonNull | undefined = undefined;
      if (dto.operatingHours) {
        try { operatingHours = JSON.parse(dto.operatingHours); } catch { operatingHours = Prisma.JsonNull; }
      }

      return await this.branchRepository.create({
        name: dto.name,
        description: dto.description,
        address: dto.address,
        city: dto.city,
        area: dto.area,
        latitude: dto.latitude,
        longitude: dto.longitude,
        googleMapsUrl: dto.googleMapsUrl,
        phoneNumber: dto.phoneNumber,
        operatingHours,
        imageUrl,
        shop: { connect: { id: shop.id } },
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed to create branch for owner ${ownerId}`, error instanceof Error ? error.stack : error);
      throw new InternalServerErrorException('Failed to create branch');
    }
  }

  async listBranches(ownerId: number, page: number, limit: number) {
    try {
      const shop = await this.resolveShop(ownerId);
      const skip = (page - 1) * limit;
      const [branches, total] = await this.branchRepository.findAllByShop(shop.id, skip, limit);
      return { data: branches, total, page, limit, totalPages: Math.ceil(total / limit) };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed to list branches for owner ${ownerId}`, error instanceof Error ? error.stack : error);
      throw new InternalServerErrorException('Failed to list branches');
    }
  }

  async getBranch(ownerId: number, branchId: string) {
    try {
      return await this.resolveBranch(branchId, ownerId);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed to get branch ${branchId}`, error instanceof Error ? error.stack : error);
      throw new InternalServerErrorException('Failed to get branch');
    }
  }

  async updateBranch(ownerId: number, branchId: string, dto: ShopAdminUpdateBranchDto, file?: Express.Multer.File) {
    try {
      await this.resolveBranch(branchId, ownerId);

      let imageUrl: string | undefined;
      if (file) imageUrl = await this.uploadService.uploadImage('branch/', file);

      let operatingHours: Prisma.InputJsonValue | typeof Prisma.JsonNull | undefined = undefined;
      if (dto.operatingHours) {
        try { operatingHours = JSON.parse(dto.operatingHours); } catch { operatingHours = Prisma.JsonNull; }
      }

      const { operatingHours: _oh, ...rest } = dto;
      return await this.branchRepository.update(branchId, {
        ...rest,
        ...(operatingHours !== undefined && { operatingHours }),
        ...(imageUrl && { imageUrl }),
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed to update branch ${branchId}`, error instanceof Error ? error.stack : error);
      throw new InternalServerErrorException('Failed to update branch');
    }
  }

  async deleteBranch(ownerId: number, branchId: string) {
    try {
      await this.resolveBranch(branchId, ownerId);
      return await this.branchRepository.delete(branchId);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed to delete branch ${branchId}`, error instanceof Error ? error.stack : error);
      throw new InternalServerErrorException('Failed to delete branch');
    }
  }
}
