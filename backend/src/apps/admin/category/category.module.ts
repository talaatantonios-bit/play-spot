import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { CategoryRepository } from './category.repository';
import { UploadModule } from '../../../upload/upload.module';

@Module({
  imports: [UploadModule],
  controllers: [CategoryController],
  providers: [CategoryService, CategoryRepository],
})
export class AdminCategoryModule {}
