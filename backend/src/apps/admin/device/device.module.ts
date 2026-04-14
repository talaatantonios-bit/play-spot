import { Module } from '@nestjs/common';
import { AdminDeviceController } from './device.controller';
import { AdminDeviceService } from './device.service';
import { AdminDeviceRepository } from './device.repository';
import { AdminDeviceGameRepository } from './device-game.repository';
import { AdminBranchRepository } from '../branch/branch.repository';
import { AdminShopRepository } from '../shop/shop.repository';
import { UploadModule } from '../../../upload/upload.module';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule, UploadModule],
  controllers: [AdminDeviceController],
  providers: [
    AdminDeviceService,
    AdminDeviceRepository,
    AdminDeviceGameRepository,
    AdminBranchRepository,
    AdminShopRepository,
  ],
  exports: [AdminDeviceRepository],
})
export class AdminDeviceModule {}
