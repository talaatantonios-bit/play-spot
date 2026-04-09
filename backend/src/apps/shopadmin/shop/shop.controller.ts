import { Controller, Get, Patch, Body, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse, ApiNotFoundResponse, ApiForbiddenResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ShopAdminShopService } from './shop.service';
import { ShopAdminUpdateShopDto } from './dto/update-shop.dto';
import { JwtAuthGuard } from '../../mobile/auth/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../enums/role.enum';
import { GetCurrentUserId } from '../../../helpers/get-current-user-id.decorator';

@ApiTags('shopadmin/shop')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SHOP_ADMIN)
@Controller('shopadmin/shop')
export class ShopAdminShopController {
  constructor(private readonly shopService: ShopAdminShopService) {}

  @Get('my')
  @ApiOperation({ summary: 'Get my shop info' })
  @ApiOkResponse({ description: 'Shop data' })
  @ApiNotFoundResponse({ description: 'Shop not found.' })
  @ApiForbiddenResponse({ description: 'Shop is blocked.' })
  getMyShop(@GetCurrentUserId() userId: number) {
    return this.shopService.getMyShop(userId);
  }

  @Patch('my')
  @ApiOperation({ summary: 'Update my shop info and/or logo' })
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({ description: 'Updated shop data' })
  @ApiNotFoundResponse({ description: 'Shop not found.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name:        { type: 'string' },
        description: { type: 'string' },
        phoneNumber: { type: 'string' },
        logo:        { type: 'string', format: 'binary', description: 'Shop logo image' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('logo'))
  updateMyShop(
    @GetCurrentUserId() userId: number,
    @Body() dto: ShopAdminUpdateShopDto,
    @UploadedFile() logo?: Express.Multer.File,
  ) {
    return this.shopService.updateMyShop(userId, dto, logo);
  }
}
