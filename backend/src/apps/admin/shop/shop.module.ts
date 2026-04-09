import { Module } from '@nestjs/common';
import { AdminShopController } from './shop.controller';
import { AdminShopService } from './shop.service';
import { AdminShopRepository } from './shop.repository';
import { UsersModule } from '../../mobile/users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [AdminShopController],
  providers: [AdminShopService, AdminShopRepository],
})
export class AdminShopModule {}
