import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GameSummaryResponse {
  @ApiProperty({ example: 'uuid-string' })
  id: string;

  @ApiProperty({ example: 'FIFA 25' })
  title: string;

  @ApiPropertyOptional({ example: 'فيفا 25' })
  titleAr?: string;

  @ApiPropertyOptional({ example: 'The world-famous football game.' })
  description?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/fifa25.jpg' })
  coverImageUrl?: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: 0 })
  displayOrder: number;
}
