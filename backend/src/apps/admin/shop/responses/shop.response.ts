import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';

export class ShopResponse {
  @ApiProperty({ example: 'uuid-string' })
  id: string;

  @ApiProperty({ example: 'My Shop' })
  name: string;

  @ApiPropertyOptional({ example: 'A great shop' })
  description?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/logo.png' })
  logoUrl?: string;

  @ApiProperty({ example: 1 })
  ownerId: number;

  @ApiProperty({ example: 'owner@example.com' })
  ownerEmail: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  phoneNumber?: string;

  @ApiProperty({ enum: SubscriptionStatus, example: SubscriptionStatus.trial })
  subscriptionStatus: SubscriptionStatus;

  @ApiProperty({ enum: SubscriptionPlan, example: SubscriptionPlan.basic })
  subscriptionPlan: SubscriptionPlan;

  @ApiPropertyOptional({ example: '2026-01-01T00:00:00.000Z' })
  subscriptionStart?: Date;

  @ApiPropertyOptional({ example: '2027-01-01T00:00:00.000Z' })
  subscriptionEnd?: Date;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: false })
  isBlocked: boolean;

  @ApiPropertyOptional({ example: 'Violated terms' })
  blockedReason?: string;

  @ApiProperty({ example: 0 })
  totalBranches: number;

  @ApiProperty({ example: 0 })
  totalDevices: number;

  @ApiProperty({ example: 0 })
  totalBookings: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  createdBy?: string;
}
