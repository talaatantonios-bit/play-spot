import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserService } from './user.service';
import { GetCurrentUserId } from '../helpers/get-current-user-id.decorator';

@ApiTags('users')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@GetCurrentUserId() userId: number) {
    return this.userService.getUserProfile(userId);
  }
}
