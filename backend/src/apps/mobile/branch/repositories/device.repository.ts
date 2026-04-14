import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class MobileDeviceRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all active devices for a branch, ordered by displayOrder
   */
  async findAllByBranch(branchId: string) {
    return this.prisma.device.findMany({
      where: { branchId, isActive: true },
      orderBy: { displayOrder: 'asc' },
    });
  }

  /**
   * Get a single active device by ID within a branch, including its linked games
   */
  async findByIdWithGames(branchId: string, deviceId: string) {
    return this.prisma.device.findFirst({
      where: { id: deviceId, branchId, isActive: true },
      include: {
        games: {
          include: {
            game: {
              select: {
                id: true,
                title: true,
                titleAr: true,
                description: true,
                coverImageUrl: true,
                isActive: true,
                displayOrder: true,
              },
            },
          },
        },
      },
    });
  }
}
