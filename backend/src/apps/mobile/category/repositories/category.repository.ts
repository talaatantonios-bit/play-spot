import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { Category } from '@prisma/client';

@Injectable()
export class CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findActiveCategoriesPaginated(skip: number, take: number): Promise<[Category[], number]> {
    return this.prisma.$transaction([
      this.prisma.category.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' },
        skip,
        take,
      }),
      this.prisma.category.count({
        where: { isActive: true },
      }),
    ]);
  }
}
