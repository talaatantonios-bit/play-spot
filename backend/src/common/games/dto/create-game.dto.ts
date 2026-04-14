import { IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGameDto {
  @ApiProperty({ description: 'English title of the game' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Arabic title of the game' })
  @IsOptional()
  @IsString()
  titleAr?: string;

  @ApiProperty({ description: 'Category ID integer', type: Number })
  @IsInt()
  @Type(() => Number)
  categoryId: number;

  @ApiPropertyOptional({ description: 'Game description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Whether the game is active', type: Boolean, default: true })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Display order', type: Number, default: 0 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  displayOrder?: number;
}
