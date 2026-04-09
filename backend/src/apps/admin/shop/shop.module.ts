import { Module } from '@nestjs/common';
import { AdminShopController } from './shop.controller';
import { AdminShopService } from './shop.service';
import { AdminShopRepository } from './shop.repository';
import { UsersModule } from '../../mobile/users/users.module';
import { UploadModule } from '../../../upload/upload.module';

@Module({
  imports: [UsersModule, UploadModule],
  controllers: [AdminShopController],
  providers: [AdminShopService, AdminShopRepository],
  exports: [AdminShopRepository],
})
export class AdminShopModule {}
