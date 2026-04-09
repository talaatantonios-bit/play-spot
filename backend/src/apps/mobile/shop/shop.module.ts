import { Module } from '@nestjs/common';
import { MobileShopController } from './shop.controller';
import { MobileShopService } from './shop.service';
import { MobileShopRepository } from './repositories/shop.repository';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MobileShopController],
  providers: [MobileShopService, MobileShopRepository],
  exports: [MobileShopRepository],
})
export class MobileShopModule {}
