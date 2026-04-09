import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Branch, Prisma } from '@prisma/client';

@Injectable()
export class ShopAdminBranchRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.BranchCreateInput): Promise<Branch> {
    return this.prisma.branch.create({ data });
  }

  async findById(id: string): Promise<Branch | null> {
    return this.prisma.branch.findUnique({ where: { id } });
  }

  async findAllByShop(shopId: string, skip: number, take: number): Promise<[Branch[], number]> {
    return this.prisma.$transaction([
      this.prisma.branch.findMany({ where: { shopId }, skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.branch.count({ where: { shopId } }),
    ]);
  }

  async update(id: string, data: Prisma.BranchUpdateInput): Promise<Branch> {
    return this.prisma.branch.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Branch> {
    return this.prisma.branch.delete({ where: { id } });
  }
}
