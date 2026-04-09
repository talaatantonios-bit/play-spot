import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma, Shop } from '@prisma/client';

@Injectable()
export class ShopAdminShopRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByOwnerId(ownerId: number): Promise<Shop | null> {
    return this.prisma.shop.findUnique({ where: { ownerId } });
  }

  async update(ownerId: number, data: Prisma.ShopUpdateInput): Promise<Shop> {
    return this.prisma.shop.update({ where: { ownerId }, data });
  }
}
