import { ApiProperty } from '@nestjs/swagger';
import { CategoryResponseDto } from './category-response.dto';

export class PaginatedCategoryResponseDto {
  @ApiProperty({ type: [CategoryResponseDto], description: 'List of categories for the current page' })
  data: CategoryResponseDto[];

  @ApiProperty({ example: 100, description: 'Total number of active categories' })
  total: number;

  @ApiProperty({ example: 1, description: 'Current page number' })
  page: number;

  @ApiProperty({ example: 10, description: 'Number of items per page' })
  limit: number;

  @ApiProperty({ example: 10, description: 'Total number of pages available' })
  totalPages: number;
}
