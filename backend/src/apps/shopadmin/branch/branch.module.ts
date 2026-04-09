import { Module } from '@nestjs/common';
import { ShopAdminBranchController } from './branch.controller';
import { ShopAdminBranchService } from './branch.service';
import { ShopAdminBranchRepository } from './branch.repository';
import { ShopAdminShopRepository } from '../shop/shop.repository';
import { PrismaModule } from '../../../prisma/prisma.module';
import { UploadModule } from '../../../upload/upload.module';

@Module({
  imports: [PrismaModule, UploadModule],
  controllers: [ShopAdminBranchController],
  providers: [ShopAdminBranchService, ShopAdminBranchRepository, ShopAdminShopRepository],
})
export class ShopAdminBranchModule {}
