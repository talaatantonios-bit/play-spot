import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createCategory(data: {
    name: string;
    description?: string;
    imageUrl?: string;
    displayOrder?: number;
    isActive?: boolean;
    locale?: any;
  }) {
    return this.prisma.category.create({
      data,
    });
  }
}
