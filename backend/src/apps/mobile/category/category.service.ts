import { Injectable } from '@nestjs/common';
import { CategoryRepository } from './repositories/category.repository';
import { PaginatedCategoryResponseDto } from './responses/paginated-category-response.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async findAll(page: number, limit: number): Promise<PaginatedCategoryResponseDto> {
    const skip = (page - 1) * limit;
    
    const [categories, total] = await this.categoryRepository.findActiveCategoriesPaginated(skip, limit);
    
    return {
      data: categories as any, // Type casting to match DTO if needed
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
