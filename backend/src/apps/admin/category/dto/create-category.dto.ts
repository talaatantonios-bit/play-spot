import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ description: 'The name of the category' })
  name: string;

  @ApiPropertyOptional({ description: 'Description of the category' })
  description?: string;

  @ApiPropertyOptional({ description: 'Order of display', default: 0 })
  displayOrder?: number;

  @ApiPropertyOptional({ description: 'Whether the category is active', default: true })
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Locale JSON data, e.g. {"nameAr": "ar", "nameEn": "en"}' })
  locale?: string;
}
