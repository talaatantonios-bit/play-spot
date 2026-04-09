import { Module } from '@nestjs/common';
import { AdminAuthController } from './auth.controller';
import { AdminAuthService } from './auth.service';
import { UsersModule } from '../../mobile/users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [AdminAuthController],
  providers: [AdminAuthService],
})
export class AdminAuthModule {}
