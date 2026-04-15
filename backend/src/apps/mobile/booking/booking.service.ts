import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  InternalServerErrorException,
  Logger,
  HttpException,
} from '@nestjs/common';
import { BookingRepository } from './booking.repository';
import { AdminDeviceRepository } from '../../admin/device/device.repository';
import { AdminBranchRepository } from '../../admin/branch/branch.repository';
import { UserRepository } from '../users/repositories/user.repository';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingStatus, DeviceStatus } from '@prisma/client';
import {
  isValidBookingStartTime,
  isCancellationAllowed,
  getMinutesUntil,
  formatMinutes,
  BOOKING_MIN_ADVANCE_MINUTES,
} from '../../../common/utils/time.utils';

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly deviceRepository: AdminDeviceRepository,
    private readonly branchRepository: AdminBranchRepository,
    private readonly userRepository: UserRepository,
  ) {}

  // ─── Private Helpers ────────────────────────────────────────────────────────

  private async validateDevice(deviceId: string) {
    const device = await this.deviceRepository.findById(deviceId);
    if (!device) throw new NotFoundException('Device not found');
    if (!device.isActive) throw new BadRequestException('Device is not active');
    if (device.status !== DeviceStatus.available) {
      throw new BadRequestException(`Device is currently ${device.status}`);
    }
    return device;
  }

  private async validateBranch(branchId: string) {
    const branch = await this.branchRepository.findById(branchId);
    if (!branch) throw new NotFoundException('Branch not found');
    if (!branch.isActive) throw new BadRequestException('Branch is not active');
    return branch;
  }

  private async validateUserBalance(userId: number) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    
    // Check if user has sufficient balance (you can adjust this logic based on pricing)
    if (user.coinsCount <= 0) {
      throw new BadRequestException('Insufficient coin balance. Please top up your account.');
    }
    
    return user;
  }

  private validateStartTime(startTime: Date) {
    if (!isValidBookingStartTime(startTime)) {
      const minutesUntil = getMinutesUntil(startTime);
      if (minutesUntil < 0) {
        throw new BadRequestException('Start time cannot be in the past');
      }
      throw new BadRequestException(
        `Booking must be made at least ${BOOKING_MIN_ADVANCE_MINUTES} minutes in advance. ` +
        `Your selected time is only ${formatMinutes(minutesUntil)} away.`
      );
    }
  }

  private validateEndTime(startTime: Date, endTime: Date | null) {
    if (endTime !== null) {
      if (endTime <= startTime) {
        throw new BadRequestException('End time must be after start time');
      }
    }
  }

  private async checkConflictingBookings(deviceId: string, startTime: Date, endTime: Date | null) {
    const hasConflict = await this.bookingRepository.hasConflictingBooking(deviceId, startTime, endTime);
    if (hasConflict) {
      throw new ConflictException(
        'This device is already booked for the selected time range. ' +
        (endTime === null ? 'There is an active open-ended booking.' : 'Please choose a different time slot.')
      );
    }
  }

  // ─── Public Methods ──────────────────────────────────────────────────────────

  async createBooking(userId: number, dto: CreateBookingDto) {
    try {
      const startTime = new Date(dto.startTime);
      const endTime = dto.endTime ? new Date(dto.endTime) : null;

      // 1. Validate start time (at least 10 minutes in future)
      this.validateStartTime(startTime);

      // 2. Validate end time (if provided, must be after start time)
      this.validateEndTime(startTime, endTime);

      // 3. Validate branch exists and is active
      const branch = await this.validateBranch(dto.branchId);

      // 4. Validate device exists, is active, and available
      const device = await this.validateDevice(dto.deviceId);

      // 5. Verify device belongs to branch
      if (device.branchId !== dto.branchId) {
        throw new BadRequestException('Device does not belong to the specified branch');
      }

      // 6. Check user balance (don't deduct, just verify)
      await this.validateUserBalance(userId);

      // 7. Check for conflicting bookings (time range overlap)
      await this.checkConflictingBookings(dto.deviceId, startTime, endTime);

      // 8. Create booking with pending status
      return await this.bookingRepository.create({
        user: { connect: { id: userId } },
        shop: { connect: { id: device.shopId } },
        branch: { connect: { id: dto.branchId } },
        device: { connect: { id: dto.deviceId } },
        startTime,
        ...(endTime && { endTime }),
        userNotes: dto.userNotes,
        status: BookingStatus.pending,
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error('Failed to create booking', error instanceof Error ? error.stack : error);
     
      throw new InternalServerErrorException('Failed to create booking');
    }
  }

  async listMyBookings(userId: number, page: number, limit: number) {
    try {
      const skip = (page - 1) * limit;
      const [bookings, total] = await this.bookingRepository.findByUserId(userId, skip, limit);
      return { data: bookings, total, page, limit, totalPages: Math.ceil(total / limit) };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed to list bookings for user ${userId}`, error instanceof Error ? error.stack : error);
      throw new InternalServerErrorException('Failed to list bookings');
    }
  }

  async getMyBooking(userId: number, bookingId: string) {
    try {
      const booking = await this.bookingRepository.findById(bookingId);
      if (!booking) throw new NotFoundException('Booking not found');
      
      // Verify ownership
      if (booking.userId !== userId) {
        throw new ForbiddenException('You do not have access to this booking');
      }

      return booking;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed to get booking ${bookingId}`, error instanceof Error ? error.stack : error);
      throw new InternalServerErrorException('Failed to get booking');
    }
  }

  async cancelBooking(userId: number, bookingId: string) {
    try {
      const booking = await this.getMyBooking(userId, bookingId);

      // Check if booking can be cancelled
      if (booking.status === BookingStatus.cancelled) {
        throw new BadRequestException('Booking is already cancelled');
      }

      if (booking.status === BookingStatus.completed) {
        throw new BadRequestException('Cannot cancel a completed booking');
      }

      if (booking.status === BookingStatus.active) {
        throw new BadRequestException('Cannot cancel an active booking');
      }

      // Check if cancellation is within time limit (at least 10 minutes before start)
      if (!isCancellationAllowed(booking.startTime)) {
        const minutesUntil = getMinutesUntil(booking.startTime);
        throw new BadRequestException(
          `Cancellation must be done at least ${BOOKING_MIN_ADVANCE_MINUTES} minutes before start time. ` +
          `Only ${formatMinutes(minutesUntil)} remaining.`
        );
      }

      // Cancel the booking
      return await this.bookingRepository.updateStatus(
        bookingId,
        BookingStatus.cancelled,
        { cancelledAt: new Date() }
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed to cancel booking ${bookingId}`, error instanceof Error ? error.stack : error);
      throw new InternalServerErrorException('Failed to cancel booking');
    }
  }
}
