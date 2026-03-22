import { Controller, Post, Body, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { JwtAuthGuard } from '../../mobile/auth/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../enums/role.enum';

@ApiTags('admin/category')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
@Controller('admin/category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new category (SuperAdmin only)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'The name of the category' },
        description: { type: 'string', nullable: true },
        displayOrder: { type: 'number', default: 0 },
        isActive: { type: 'boolean', default: true },
        locale: { 
          type: 'string', 
          description: 'JSON string for translations, e.g. {"nameAr": "ar", "nameEn": "en"}' 
        },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Category image file',
        },
      },
      required: ['name'],
    },
  })
  @UseInterceptors(FileInterceptor('image'))
  async createCategory(
    @Body() dto: CreateCategoryDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.categoryService.createCategory(dto, image);
  }
}
