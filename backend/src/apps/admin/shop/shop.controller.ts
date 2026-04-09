import { Controller, Post, Get, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { AdminShopService } from './shop.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { BlockShopDto } from './dto/block-shop.dto';
import { ListShopsQueryDto } from './dto/list-shops-query.dto';
import { ShopResponse } from './responses/shop.response';
import { JwtAuthGuard } from '../../mobile/auth/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../enums/role.enum';
import { GetCurrentUserId } from '../../../helpers/get-current-user-id.decorator';

@ApiTags('admin/shop')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
@Controller('admin/shop')
export class AdminShopController {
  constructor(private readonly shopService: AdminShopService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new shop (SuperAdmin only)' })
  @ApiCreatedResponse({ type: ShopResponse })
  @ApiForbiddenResponse({ description: 'Only SUPER_ADMIN can access this endpoint.' })
  createShop(
    @Body() dto: CreateShopDto,
    @GetCurrentUserId() userId: number,
  ) {
    return this.shopService.createShop(dto, String(userId));
  }

  @Get()
  @ApiOperation({ summary: 'List all shops with filters (SuperAdmin only)' })
  @ApiOkResponse({ description: 'Paginated list of shops' })
  listShops(@Query() query: ListShopsQueryDto) {
    return this.shopService.listShops(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a shop by ID (SuperAdmin only)' })
  @ApiOkResponse({ type: ShopResponse })
  @ApiNotFoundResponse({ description: 'Shop not found.' })
  getShop(@Param('id') id: string) {
    return this.shopService.getShop(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a shop (SuperAdmin only)' })
  @ApiOkResponse({ type: ShopResponse })
  @ApiNotFoundResponse({ description: 'Shop not found.' })
  updateShop(@Param('id') id: string, @Body() dto: UpdateShopDto) {
    return this.shopService.updateShop(id, dto);
  }

  @Patch(':id/block')
  @ApiOperation({ summary: 'Block a shop (SuperAdmin only)' })
  @ApiOkResponse({ type: ShopResponse })
  @ApiNotFoundResponse({ description: 'Shop not found.' })
  blockShop(@Param('id') id: string, @Body() dto: BlockShopDto) {
    return this.shopService.blockShop(id, dto);
  }

  @Patch(':id/unblock')
  @ApiOperation({ summary: 'Unblock a shop (SuperAdmin only)' })
  @ApiOkResponse({ type: ShopResponse })
  @ApiNotFoundResponse({ description: 'Shop not found.' })
  unblockShop(@Param('id') id: string) {
    return this.shopService.unblockShop(id);
  }
}
