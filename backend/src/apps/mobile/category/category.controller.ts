import { Controller, Get, Query, DefaultValuePipe, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CategoryService } from './category.service';
import { PaginatedCategoryResponseDto } from './responses/paginated-category-response.dto';

@ApiTags('mobile/category')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('mobile/category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active categories sorted by display order' })
  @ApiOkResponse({
    description: 'Returns a paginated list of categories',
    type: PaginatedCategoryResponseDto,
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  async getAllCategories(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.categoryService.findAll(page, limit);
  }
}
