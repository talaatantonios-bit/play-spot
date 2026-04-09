import { Module } from '@nestjs/common';
import { ShopAdminController } from './shopadmin.controller';
import { ShopAdminService } from './shopadmin.service';
import { ShopAdminRepository } from './repositories/shopadmin.repository';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ShopAdminController],
  providers: [ShopAdminService, ShopAdminRepository],
})
export class ShopAdminModule {}
