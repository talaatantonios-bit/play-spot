import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Device, Prisma } from '@prisma/client';

@Injectable()
export class AdminDeviceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.DeviceCreateInput): Promise<Device> {
    return this.prisma.device.create({ data });
  }

  async findById(id: string): Promise<Device | null> {
    return this.prisma.device.findUnique({ where: { id } });
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
      }),
      this.prisma.device.count({ where: { branchId } }),
    ]);
  }

  async delete(id: string): Promise<Device> {
    return this.prisma.device.delete({ where: { id } });
  }
}
