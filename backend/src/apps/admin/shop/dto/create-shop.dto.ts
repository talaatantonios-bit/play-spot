import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';

export class CreateShopDto {
  @ApiProperty({ example: 'My Shop' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name: string;

  @ApiPropertyOptional({ example: 'A great shop' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 1, description: 'User ID of the shop owner (must have SHOP_ADMIN role)' })
  @Type(() => Number)
  @IsInt()
  ownerId: number;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ enum: SubscriptionStatus, default: SubscriptionStatus.trial })
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  subscriptionStatus?: SubscriptionStatus;

  @ApiPropertyOptional({ enum: SubscriptionPlan, default: SubscriptionPlan.basic })
  @IsOptional()
  @IsEnum(SubscriptionPlan)
  subscriptionPlan?: SubscriptionPlan;

  @ApiPropertyOptional({ example: '2026-01-01T00:00:00.000Z', description: 'ISO 8601 date string — leave blank to skip' })
  @IsOptional()
  @Transform(({ value }) => (value === '' || value === null ? undefined : value))
  @IsDateString()
  subscriptionStart?: string;

  @ApiPropertyOptional({ example: '2027-01-01T00:00:00.000Z', description: 'ISO 8601 date string — leave blank to skip' })
  @IsOptional()
  @Transform(({ value }) => (value === '' || value === null ? undefined : value))
  @IsDateString()
  subscriptionEnd?: string;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  totalBranches?: number;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  totalDevices?: number;
}
