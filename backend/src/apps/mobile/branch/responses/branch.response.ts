import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MobileBranchResponse {
  @ApiProperty({ example: 'uuid-string' })
  id: string;

  @ApiProperty({ example: 'uuid-of-shop' })
  shopId: string;

  @ApiProperty({ example: 'Downtown Branch' })
  name: string;

  @ApiPropertyOptional({ example: 'Our main branch' })
  description?: string;

  @ApiProperty({ example: '123 Main St' })
  address: string;

  @ApiProperty({ example: 'Cairo' })
  city: string;

  @ApiProperty({ example: 'Maadi' })
  area: string;

  @ApiPropertyOptional({ example: 30.0444 })
  latitude?: number;

  @ApiPropertyOptional({ example: 31.2357 })
  longitude?: number;

  @ApiPropertyOptional({ example: 'https://maps.google.com/?q=...' })
  googleMapsUrl?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/branch.png' })
  imageUrl?: string;

  @ApiPropertyOptional({ example: '+201234567890' })
  phoneNumber?: string;

  @ApiPropertyOptional({
    example: { saturday: { open: '09:00', close: '22:00' } },
    description: 'Operating hours per day',
  })
  operatingHours?: any;

  @ApiProperty({ example: 'open', enum: ['open', 'close'], description: 'Current status based on operating hours' })
  status?: string;


  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: 0 })
  totalDevices: number;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
