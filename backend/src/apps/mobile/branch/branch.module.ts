import { Module } from '@nestjs/common';
import { MobileBranchController } from './branch.controller';
import { MobileBranchService } from './branch.service';
import { MobileBranchRepository } from './repositories/branch.repository';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MobileBranchController],
  providers: [MobileBranchService, MobileBranchRepository],
})
export class MobileBranchModule {}
