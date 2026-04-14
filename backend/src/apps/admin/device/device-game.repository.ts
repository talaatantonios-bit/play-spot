import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AdminDeviceGameRepository {
  constructor(private readonly prisma: PrismaService) {}

  async replaceGames(deviceId: string, gameIds: string[]): Promise<void> {
    await this.prisma.deviceGame.deleteMany({ where: { deviceId } });

    if (gameIds.length > 0) {
      await this.prisma.deviceGame.createMany({
        data: gameIds.map((gameId) => ({ deviceId, gameId })),
      });
    }
  }

  async findByDevice(deviceId: string) {
    return this.prisma.deviceGame.findMany({
      where: { deviceId },
      include: { game: true },
    });
  }
}
