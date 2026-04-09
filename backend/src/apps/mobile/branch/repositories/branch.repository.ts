import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { Branch } from '@prisma/client';

export interface FindBranchesParams {
  shopId: string;
  skip: number;
  take: number;
  area?: string;
}

@Injectable()
export class MobileBranchRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findActiveByShop(params: FindBranchesParams): Promise<[Branch[], number]> {
    const where = {
      shopId: params.shopId,
      isActive: true,
      ...(params.area && { area: { equals: params.area, mode: 'insensitive' as const } }),
    };

    return this.prisma.$transaction([
      this.prisma.branch.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.branch.count({ where }),
    ]);
  }

  async findById(id: string): Promise<Branch | null> {
    return this.prisma.branch.findUnique({ where: { id } });
  }
}
