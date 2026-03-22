import { Injectable } from '@nestjs/common';
import { CategoryRepository } from './category.repository';
import { UploadService } from '../../../upload/upload.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly uploadService: UploadService,
  ) {}

  async createCategory(dto: CreateCategoryDto, file?: Express.Multer.File) {
    let imageUrl: string | undefined;
    
    if (file) {
      imageUrl = await this.uploadService.uploadImage('category/', file);
    }

    let parsedLocale = null;
    if (dto.locale) {
      try {
        parsedLocale = typeof dto.locale === 'string' ? JSON.parse(dto.locale) : dto.locale;
      } catch (e) {
        parsedLocale = null;
      }
    }

    return this.categoryRepository.createCategory({
      name: dto.name,
      description: dto.description,
      displayOrder: dto.displayOrder ? Number(dto.displayOrder) : 0,
      isActive: dto.isActive !== undefined ? String(dto.isActive) === 'true' : true,
      locale: parsedLocale,
      imageUrl,
    });
  }
}
