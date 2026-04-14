import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GameSummaryResponse } from './game-summary.response';

export class MobileDeviceResponse {
  @ApiProperty({ example: 'uuid-string' })
  id: string;

  @ApiProperty({ example: 'branch-uuid' })
  branchId: string;

  @ApiProperty({ example: 'shop-uuid' })
  shopId: string;

  @ApiProperty({ example: 'PS5 Room 1' })
  name: string;

  @ApiPropertyOptional({ example: 'D-001' })
  deviceNumber?: string;

  @ApiProperty({ example: 'PS5' })
  deviceType: string;

  @ApiProperty({ example: 100 })
  roomHourlyPrice: number;

  @ApiProperty({ example: 80 })
  singleHourlyPrice: number;

  @ApiProperty({ example: 60 })
  multiplayerHourlyPrice: number;

  @ApiProperty({ example: 'available' })
  status: string;

  @ApiProperty({ example: false })
  isVipRoom: boolean;

  @ApiProperty({ example: 4 })
  maxPlayers: number;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/device.jpg' })
  imageUrl?: string;

  @ApiProperty({ example: 0 })
  displayOrder: number;

  @ApiProperty({ type: [GameSummaryResponse] })
  games: GameSummaryResponse[];
}
