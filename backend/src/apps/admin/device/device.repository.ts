import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Device, Prisma } from '@prisma/client';

const DEVICE_WITH_GAMES = {
  games: { include: { game: true } },
} satisfies Prisma.DeviceInclude;

@Injectable()
export class AdminDeviceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.DeviceCreateInput): Promise<Device> {
    return this.prisma.device.create({
      data,
      include: DEVICE_WITH_GAMES,
    });
  }

  async findById(id: string): Promise<Device | null> {
    return this.prisma.device.findUnique({
      where: { id },
      include: DEVICE_WITH_GAMES,
    });
  }

  async findAllByBranch(
    branchId: string,
    skip: number,
    take: number,
  ): Promise<[Device[], number]> {
    return this.prisma.$transaction([
      this.prisma.device.findMany({
        where: { branchId },
        skip,
        take,
        orderBy: { displayOrder: 'asc' },
        include: DEVICE_WITH_GAMES,
      }),
      this.prisma.device.count({ where: { branchId } }),
    ]);
  }

  async update(id: string, data: Prisma.DeviceUpdateInput): Promise<Device> {
    return this.prisma.device.update({
      where: { id },
      data,
      include: DEVICE_WITH_GAMES,
    });
  }

  async delete(id: string): Promise<Device> {
    return this.prisma.device.delete({ where: { id } });
  }
}
