import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateCategoryDto {
  @ApiProperty({ description: 'The name of the category', example: 'Action Games' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name: string;

  @ApiPropertyOptional({ description: 'Description of the category' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Order of display', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional({ description: 'Whether the category is active', default: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Locale JSON string e.g. {"nameAr": "العاب", "nameEn": "Games"}' })
  @IsOptional()
  @IsString()
  locale?: string;
}
