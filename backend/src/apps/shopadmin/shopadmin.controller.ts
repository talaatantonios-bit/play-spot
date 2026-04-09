import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse, ApiForbiddenResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { ShopAdminService } from './shopadmin.service';
import { UpdateMyShopDto } from './dto/update-my-shop.dto';
import { ShopResponse } from './responses/shop.response';
import { JwtAuthGuard } from '../mobile/auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../enums/role.enum';
import { GetCurrentUserId } from '../../helpers/get-current-user-id.decorator';

@ApiTags('shopadmin')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SHOP_ADMIN)
@Controller('shopadmin')
export class ShopAdminController {
  constructor(private readonly shopAdminService: ShopAdminService) {}

  @Get('my')
  @ApiOperation({ summary: 'Get my shop (ShopAdmin only)' })
  @ApiOkResponse({ type: ShopResponse })
  @ApiNotFoundResponse({ description: 'Shop not found.' })
  @ApiForbiddenResponse({ description: 'Shop is blocked.' })
  getMyShop(@GetCurrentUserId() userId: number) {
    return this.shopAdminService.getMyShop(userId);
  }

  @Patch('my')
  @ApiOperation({ summary: 'Update my shop (ShopAdmin only)' })
  @ApiOkResponse({ type: ShopResponse })
  @ApiNotFoundResponse({ description: 'Shop not found.' })
  updateMyShop(
    @GetCurrentUserId() userId: number,
    @Body() dto: UpdateMyShopDto,
  ) {
    return this.shopAdminService.updateMyShop(userId, dto);
  }
}
