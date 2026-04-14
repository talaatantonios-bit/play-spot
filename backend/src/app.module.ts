import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerMiddleware } from './logger.middleware';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './apps/mobile/auth/auth.module';
import { UsersModule } from './apps/mobile/users/users.module';
import { CoinsModule } from './apps/mobile/coins/coins.module';
import { CategoryModule } from './apps/mobile/category/category.module';
import { AdminCategoryModule } from './apps/admin/category/category.module';
import { AdminAuthModule } from './apps/admin/auth/auth.module';
import { AdminShopModule } from './apps/admin/shop/shop.module';
import { MobileShopModule } from './apps/mobile/shop/shop.module';
import { ShopAdminModule } from './apps/shopadmin/shopadmin.module';
import { AdminBranchModule } from './apps/admin/branch/branch.module';
import { MobileBranchModule } from './apps/mobile/branch/branch.module';
import { AdminDeviceModule } from './apps/admin/device/device.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    CoinsModule,
    CategoryModule,
    AdminCategoryModule,
    AdminAuthModule,
    AdminShopModule,
    MobileShopModule,
    ShopAdminModule,
    AdminBranchModule,
    MobileBranchModule,
    AdminDeviceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
