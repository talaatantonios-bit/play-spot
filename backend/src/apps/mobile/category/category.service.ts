import { Injectable, InternalServerErrorException, Logger, HttpException } from '@nestjs/common';
import { CategoryRepository } from './repositories/category.repository';
import { PaginatedCategoryResponseDto } from './responses/paginated-category-response.dto';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);

  constructor(private readonly categoryRepository: CategoryRepository) {}

  async findAll(page: number, limit: number): Promise<PaginatedCategoryResponseDto> {
    try {
      const skip = (page - 1) * limit;
      const [categories, total] = await this.categoryRepository.findActiveCategoriesPaginated(skip, limit);

      return {
        data: categories as any,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error('Failed to fetch categories', error instanceof Error ? error.stack : error);
      throw new InternalServerErrorException('Failed to fetch categories');
    }
  }
}
