import { Module } from '@nestjs/common';
import { ShopAdminShopModule } from './shop/shop.module';
import { ShopAdminBranchModule } from './branch/branch.module';

@Module({
  imports: [ShopAdminShopModule, ShopAdminBranchModule],
})
export class ShopAdminModule {}
