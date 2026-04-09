import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { Shop } from '@prisma/client';

@Injectable()
export class MobileShopRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(skip: number, take: number): Promise<[Shop[], number]> {
    return this.prisma.$transaction([
      this.prisma.shop.findMany({
        where: { isActive: true, isBlocked: false },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.shop.count({
        where: { isActive: true, isBlocked: false },
      }),
    ]);
  }

  async findById(id: string): Promise<Shop | null> {
    return this.prisma.shop.findUnique({
      where: { id },
    });
  }
}
