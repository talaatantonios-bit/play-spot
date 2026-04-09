import { Controller, Get, Param, Query, DefaultValuePipe, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse, ApiNotFoundResponse, ApiQuery } from '@nestjs/swagger';
import { MobileShopService } from './shop.service';
import { ShopResponse } from './responses/shop.response';
import { PaginatedShopResponse } from './responses/paginated-shop.response';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('mobile/shop')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('mobile/shop')
export class MobileShopController {
  constructor(private readonly shopService: MobileShopService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active shops (any authenticated user)' })
  @ApiOkResponse({ type: PaginatedShopResponse })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.shopService.findAll(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get shop by ID (any authenticated user)' })
  @ApiOkResponse({ type: ShopResponse })
  @ApiNotFoundResponse({ description: 'Shop not found.' })
  findById(@Param('id') id: string) {
    return this.shopService.findById(id);
  }
}
