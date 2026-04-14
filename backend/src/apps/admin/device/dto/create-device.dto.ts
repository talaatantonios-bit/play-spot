import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsBoolean, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { DeviceType } from '@prisma/client';

export class CreateDeviceDto {
  @ApiProperty({ example: 'PS5 Room 1' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'D-001' })
  @IsOptional()
  @IsString()
  deviceNumber?: string;

  @ApiProperty({ enum: DeviceType, example: DeviceType.PS5 })
  @IsEnum(DeviceType)
  deviceType: DeviceType;

  @ApiProperty({ example: 100, description: 'Room hourly price in EGP' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  roomHourlyPrice: number;

  @ApiProperty({ example: 80, description: 'Single-player hourly price in EGP' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  singleHourlyPrice: number;

  @ApiProperty({ example: 60, description: 'Multiplayer hourly price per player in EGP' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  multiplayerHourlyPrice: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isVipRoom?: boolean;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxPlayers?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional({ example: ['uuid-1', 'uuid-2'], description: 'List of game IDs to associate with this device' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  gameIds?: string[];
}
