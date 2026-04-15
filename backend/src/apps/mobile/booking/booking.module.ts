import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { BookingRepository } from './booking.repository';
import { AdminDeviceModule } from '../../admin/device/device.module';
import { AdminBranchModule } from '../../admin/branch/branch.module';
import { UsersModule } from '../users/users.module';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    AdminDeviceModule,
    AdminBranchModule,
    UsersModule,
  ],
  controllers: [BookingController],
  providers: [BookingService, BookingRepository],
  exports: [BookingService, BookingRepository],
})
export class BookingModule {}
