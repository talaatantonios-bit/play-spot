import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiCreatedResponse, ApiConflictResponse, ApiForbiddenResponse } from '@nestjs/swagger';
import { AdminAuthService } from './auth.service';
import { AdminCreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../../mobile/auth/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../enums/role.enum';

@ApiTags('admin/auth')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('create-user')
  @ApiOperation({ summary: 'Create a user with a specific role (SuperAdmin only)' })
  @ApiCreatedResponse({ description: 'User created successfully.' })
  @ApiConflictResponse({ description: 'Email already exists.' })
  @ApiForbiddenResponse({ description: 'Only SUPER_ADMIN can access this endpoint.' })
  createUser(@Body() dto: AdminCreateUserDto) {
    return this.adminAuthService.createUser(dto);
  }
}
