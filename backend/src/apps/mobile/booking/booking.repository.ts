import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Booking, BookingStatus, Prisma } from '@prisma/client';

@Injectable()
export class BookingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.BookingCreateInput): Promise<Booking> {
    return this.prisma.booking.create({
      data,
      include: {
        device: {
          include: {
            branch: true,
            shop: true,
          },
        },
      },
    });
  }

  async findById(id: string): Promise<Booking | null> {
    return this.prisma.booking.findUnique({
      where: { id },
      include: {
        device: {
          include: {
            branch: true,
            shop: true,
          },
        },
      },
    });
  }

  async findByUserId(userId: number, skip: number, take: number): Promise<[Booking[], number]> {
    return this.prisma.$transaction([
      this.prisma.booking.findMany({
        where: { userId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          device: {
            include: {
              branch: true,
              shop: true,
            },
          },
        },
      }),
      this.prisma.booking.count({ where: { userId } }),
    ]);
  }

  async hasConflictingBooking(
    deviceId: string,
    startTime: Date,
    endTime: Date | null,
    excludeBookingId?: string
  ): Promise<boolean> {
    // Find any active bookings for this device that overlap with the requested time range
    const conflictingBookings = await this.prisma.booking.findMany({
      where: {
        deviceId,
        status: {
          in: [BookingStatus.pending, BookingStatus.confirmed, BookingStatus.active],
        },
        ...(excludeBookingId && { id: { not: excludeBookingId } }),
        OR: [
          // Case 1: Existing booking has no end time (open booking) and starts before or at our start time
          {
            endTime: null,
            startTime: { lte: startTime },
          },
          // Case 2: Our booking has no end time and existing booking starts at or after our start time
          ...(endTime === null ? [{
            startTime: { gte: startTime },
          }] : []),
          // Case 3: Both have end times - check for overlap
          ...(endTime !== null ? [{
            AND: [
              { endTime: { not: null } },
              {
                OR: [
                  // Existing booking starts during our booking
                  {
                    startTime: { gte: startTime, lt: endTime },
                  },
                  // Existing booking ends during our booking
                  {
                    endTime: { gt: startTime, lte: endTime },
                  },
                  // Existing booking completely contains our booking
                  {
                    startTime: { lte: startTime },
                    endTime: { gte: endTime },
                  },
                  // Our booking completely contains existing booking
                  {
                    startTime: { gte: startTime },
                    endTime: { lte: endTime },
                  },
                ],
              },
            ],
          }] : []),
        ],
      },
    });

    return conflictingBookings.length > 0;
  }

  async updateStatus(id: string, status: BookingStatus, additionalData?: Prisma.BookingUpdateInput): Promise<Booking> {
    return this.prisma.booking.update({
      where: { id },
      data: {
        status,
        ...additionalData,
      },
      include: {
        device: {
          include: {
            branch: true,
            shop: true,
          },
        },
      },
    });
  }

  async delete(id: string): Promise<Booking> {
    return this.prisma.booking.delete({ where: { id } });
  }
}
