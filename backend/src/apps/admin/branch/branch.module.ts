import { Module } from '@nestjs/common';
import { AdminBranchController } from './branch.controller';
import { AdminBranchService } from './branch.service';
import { AdminBranchRepository } from './branch.repository';
import { AdminShopRepository } from '../shop/shop.repository';
import { UploadModule } from '../../../upload/upload.module';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule, UploadModule],
  controllers: [AdminBranchController],
  providers: [AdminBranchService, AdminBranchRepository, AdminShopRepository],
  exports: [AdminBranchRepository],
})
export class AdminBranchModule {}
