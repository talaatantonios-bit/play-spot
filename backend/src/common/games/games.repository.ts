import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GamesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page: number, limit: number) {
    const skip = (page - 1) * limit;
    
    const data = await this.prisma.game.findMany({
      skip,
      take: limit,
      include: {
        category: true,
      },
      orderBy: {
        displayOrder: 'asc',
      },
    });

    const total = await this.prisma.game.count();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string) {
    return this.prisma.game.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
  }

  async createGame(data: {
    title: string;
    titleAr?: string;
    categoryId: number;
    description?: string;
    coverImageUrl?: string;
    isActive?: boolean;
    displayOrder?: number;
  }) {
    return this.prisma.game.create({
      data,
    });
  }

  async updateGame(
    id: string,
    data: {
      title?: string;
      titleAr?: string;
      categoryId?: number;
      description?: string;
      coverImageUrl?: string;
      isActive?: boolean;
      displayOrder?: number;
    },
  ) {
    return this.prisma.game.update({
      where: { id },
      data,
    });
  }

  async deleteGame(id: string) {
    return this.prisma.game.delete({
      where: { id },
    });
  }
}
