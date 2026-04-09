import { Injectable, NotFoundException, InternalServerErrorException, Logger, HttpException } from '@nestjs/common';
import { AdminBranchRepository } from './branch.repository';
import { AdminShopRepository } from '../shop/shop.repository';
import { UploadService } from '../../../upload/upload.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AdminBranchService {
  private readonly logger = new Logger(AdminBranchService.name);

  constructor(
    private readonly branchRepository: AdminBranchRepository,
    private readonly shopRepository: AdminShopRepository,
    private readonly uploadService: UploadService,
  ) {}

  async createBranch(dto: CreateBranchDto, file?: Express.Multer.File) {
    try {
      const shop = await this.shopRepository.findById(dto.shopId);
      if (!shop) throw new NotFoundException('Shop not found');

      let imageUrl: string | undefined;
      if (file) imageUrl = await this.uploadService.uploadImage('branch/', file);

      let operatingHours: Prisma.InputJsonValue | typeof Prisma.JsonNull | undefined = undefined;
      if (dto.operatingHours) {
        try {
          operatingHours = JSON.parse(dto.operatingHours);
        } catch {
          operatingHours = Prisma.JsonNull;
        }
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
        ...(operatingHours !== undefined && { operatingHours }),
        imageUrl,
        shop: { connect: { id: dto.shopId } },
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error('Failed to create branch', error instanceof Error ? error.stack : error);
      throw new InternalServerErrorException('Failed to create branch');
    }
  }

  async listBranches(shopId: string, page: number, limit: number) {
    try {
      const shop = await this.shopRepository.findById(shopId);
      if (!shop) throw new NotFoundException('Shop not found');

      const skip = (page - 1) * limit;
      const [branches, total] = await this.branchRepository.findAllByShop(shopId, skip, limit);
      return { data: branches, total, page, limit, totalPages: Math.ceil(total / limit) };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed to list branches for shop ${shopId}`, error instanceof Error ? error.stack : error);
      throw new InternalServerErrorException('Failed to list branches');
    }
  }

  async getBranch(id: string) {
    try {
      const branch = await this.branchRepository.findById(id);
      if (!branch) throw new NotFoundException('Branch not found');
      return branch;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed to get branch ${id}`, error instanceof Error ? error.stack : error);
      throw new InternalServerErrorException('Failed to get branch');
    }
  }

  async updateBranch(id: string, dto: UpdateBranchDto, file?: Express.Multer.File) {
    try {
      await this.getBranch(id);

      let imageUrl: string | undefined;
      if (file) imageUrl = await this.uploadService.uploadImage('branch/', file);

      let operatingHours: Prisma.InputJsonValue | typeof Prisma.JsonNull | undefined = undefined;
      if (dto.operatingHours) {
        try {
          operatingHours = typeof dto.operatingHours === 'string'
            ? JSON.parse(dto.operatingHours)
            : dto.operatingHours;
        } catch { operatingHours = Prisma.JsonNull; }
      }

      const { shopId, operatingHours: _oh, ...rest } = dto;
      return await this.branchRepository.update(id, {
        ...rest,
        ...(operatingHours !== undefined && { operatingHours }),
        ...(imageUrl && { imageUrl }),
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed to update branch ${id}`, error instanceof Error ? error.stack : error);
      throw new InternalServerErrorException('Failed to update branch');
    }
  }

  async deleteBranch(id: string) {
    try {
      await this.getBranch(id);
      return await this.branchRepository.delete(id);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed to delete branch ${id}`, error instanceof Error ? error.stack : error);
      throw new InternalServerErrorException('Failed to delete branch');
    }
  }
}
