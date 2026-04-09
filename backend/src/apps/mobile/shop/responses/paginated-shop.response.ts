import { ApiProperty } from '@nestjs/swagger';
import { ShopResponse } from './shop.response';

export class PaginatedShopResponse {
  @ApiProperty({ type: [ShopResponse] })
  data: ShopResponse[];

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 10 })
  totalPages: number;
}
