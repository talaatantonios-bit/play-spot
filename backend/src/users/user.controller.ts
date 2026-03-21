import { Controller, Get, UseGuards, HttpException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiOkResponse, ApiUnauthorizedResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { UserService } from './user.service';
import { GetCurrentUserId } from '../helpers/get-current-user-id.decorator';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiOkResponse({ description: 'User profile retrieved successfully.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized. Access token is missing or expired.' })
  @ApiNotFoundResponse({ description: 'User not found.' })
  async getProfile(@GetCurrentUserId() userId: number) {
    return this.userService.getUserProfile(userId);
  }
}
