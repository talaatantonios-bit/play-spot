import { Controller, Post, Get, Patch, Body, Param, Query, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
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
  @ApiConsumes('multipart/form-data')
  @ApiCreatedResponse({ type: ShopResponse })
  @ApiForbiddenResponse({ description: 'Only SUPER_ADMIN can access this endpoint.' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['ownerId', 'name'],
      properties: {
        ownerId:           { type: 'integer' },
        name:              { type: 'string' },
        description:       { type: 'string' },
        phoneNumber:       { type: 'string' },
        subscriptionStatus:{ type: 'string', enum: ['trial', 'active', 'expired', 'cancelled'] },
        subscriptionPlan:  { type: 'string', enum: ['basic', 'pro', 'enterprise'] },
        subscriptionStart: { type: 'string', format: 'date-time' },
        subscriptionEnd:   { type: 'string', format: 'date-time' },
        totalBranches:     { type: 'integer', default: 0 },
        totalDevices:      { type: 'integer', default: 0 },
        logo:              { type: 'string', format: 'binary', description: 'Shop logo image' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('logo'))
  createShop(
    @Body() dto: CreateShopDto,
    @GetCurrentUserId() userId: number,
    @UploadedFile() logo?: Express.Multer.File,
  ) {
    return this.shopService.createShop(dto, String(userId), logo);
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
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({ type: ShopResponse })
  @ApiNotFoundResponse({ description: 'Shop not found.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name:              { type: 'string' },
        description:       { type: 'string' },
        phoneNumber:       { type: 'string' },
        isActive:          { type: 'boolean' },
        subscriptionStatus:{ type: 'string', enum: ['trial', 'active', 'expired', 'cancelled'] },
        subscriptionPlan:  { type: 'string', enum: ['basic', 'pro', 'enterprise'] },
        subscriptionStart: { type: 'string', format: 'date-time' },
        subscriptionEnd:   { type: 'string', format: 'date-time' },
        logo:              { type: 'string', format: 'binary', description: 'Shop logo image' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('logo'))
  updateShop(
    @Param('id') id: string,
    @Body() dto: UpdateShopDto,
    @UploadedFile() logo?: Express.Multer.File,
  ) {
    return this.shopService.updateShop(id, dto, logo);
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

  // ─── SHOP_ADMIN Endpoints ────────────────────────────────────────────────────

  @Get('my/info')
  @Roles(Role.SHOP_ADMIN)
  @ApiOperation({ summary: 'Get my shop info (ShopAdmin only)' })
  @ApiOkResponse({ type: ShopResponse })
  @ApiNotFoundResponse({ description: 'Shop not found' })
  @ApiForbiddenResponse({ description: 'Shop is blocked' })
  getMyShop(@GetCurrentUserId() userId: number) {
    return this.shopService.getMyShop(userId);
  }

  @Patch('my/info')
  @Roles(Role.SHOP_ADMIN)
  @ApiOperation({ summary: 'Update my shop info (ShopAdmin only)' })
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({ type: ShopResponse })
  @ApiNotFoundResponse({ description: 'Shop not found' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name:        { type: 'string' },
        description: { type: 'string' },
        phoneNumber: { type: 'string' },
        logo:        { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('logo'))
  updateMyShop(
    @GetCurrentUserId() userId: number,
    @Body() dto: UpdateShopDto,
    @UploadedFile() logo?: Express.Multer.File,
  ) {
    return this.shopService.updateMyShop(userId, dto, logo);
  }
}
