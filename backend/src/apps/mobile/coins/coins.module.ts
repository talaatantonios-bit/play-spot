import { Module } from '@nestjs/common';
import { CoinsService } from './coins.service';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [CoinsService],
  exports: [CoinsService],
})
export class CoinsModule {}
