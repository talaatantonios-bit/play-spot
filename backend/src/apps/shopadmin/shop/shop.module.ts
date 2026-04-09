import { Module } from '@nestjs/common';
import { ShopAdminShopController } from './shop.controller';
import { ShopAdminShopService } from './shop.service';
import { ShopAdminShopRepository } from './shop.repository';
import { PrismaModule } from '../../../prisma/prisma.module';
import { UploadModule } from '../../../upload/upload.module';

@Module({
  imports: [PrismaModule, UploadModule],
  controllers: [ShopAdminShopController],
  providers: [ShopAdminShopService, ShopAdminShopRepository],
  exports: [ShopAdminShopService],
})
export class ShopAdminShopModule {}
