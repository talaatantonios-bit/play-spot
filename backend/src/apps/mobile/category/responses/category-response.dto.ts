import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({ example: 1, description: 'The unique identifier of the category' })
  id: number;

  @ApiProperty({ example: 'Action', description: 'Name of the category' })
  name: string;

  @ApiPropertyOptional({ example: 'Exciting action games', description: 'Detailed description' })
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com/images/action.png', description: 'URL for the category image' })
  imageUrl?: string;

  @ApiProperty({ example: 1, description: 'Used to sort the categories in the UI' })
  displayOrder: number;

  @ApiProperty({ example: true, description: 'Whether the category is currently active' })
  isActive: boolean;

  @ApiPropertyOptional({
    example: { ar: 'أكشن', en: 'Action' },
    description: 'Localized strings for the category name/description',
    type: Object,
  })
  locale?: any;

  @ApiProperty({ example: '2023-10-01T12:00:00.000Z', description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ example: '2023-10-01T12:00:00.000Z', description: 'Last update timestamp' })
  updatedAt: Date;
}
