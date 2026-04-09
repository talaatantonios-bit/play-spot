import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma, Shop } from '@prisma/client';

@Injectable()
export class AdminShopRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.ShopCreateInput): Promise<Shop> {
    return this.prisma.shop.create({ data });
  }

  async findById(id: string): Promise<Shop | null> {
    return this.prisma.shop.findUnique({ where: { id } });
  }

  async findByOwnerId(ownerId: number): Promise<Shop | null> {
    return this.prisma.shop.findUnique({ where: { ownerId } });
  }

  async findAll(params: {
    skip: number;
    take: number;
    search?: string;
    subscriptionStatus?: string;
    isActive?: boolean;
    isBlocked?: boolean;
  }): Promise<[Shop[], number]> {
    const where: Prisma.ShopWhereInput = {
      ...(params.search && {
        OR: [
          { name: { contains: params.search, mode: 'insensitive' } },
          { ownerEmail: { contains: params.search, mode: 'insensitive' } },
        ],
      }),
      ...(params.subscriptionStatus && { subscriptionStatus: params.subscriptionStatus as any }),
      ...(params.isActive !== undefined && { isActive: params.isActive }),
      ...(params.isBlocked !== undefined && { isBlocked: params.isBlocked }),
    };

    return this.prisma.$transaction([
      this.prisma.shop.findMany({ where, skip: params.skip, take: params.take, orderBy: { createdAt: 'desc' } }),
      this.prisma.shop.count({ where }),
    ]);
  }

  async update(id: string, data: Prisma.ShopUpdateInput): Promise<Shop> {
    return this.prisma.shop.update({ where: { id }, data });
  }
}
