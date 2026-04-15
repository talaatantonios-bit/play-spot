import { IsString, IsNotEmpty, IsDateString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ example: 'uuid-branch-id', description: 'Branch ID' })
  @IsUUID()
  @IsNotEmpty()
  branchId: string;

  @ApiProperty({ example: 'uuid-device-id', description: 'Device ID' })
  @IsUUID()
  @IsNotEmpty()
  deviceId: string;

  @ApiProperty({ example: '2026-04-15T18:00:00Z', description: 'Booking start time (ISO 8601)' })
  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @ApiPropertyOptional({ example: '2026-04-15T20:00:00Z', description: 'Booking end time (ISO 8601). Leave empty for open-ended booking.' })
  @IsOptional()
  @IsDateString()
  endTime?: string;

  @ApiPropertyOptional({ example: 'Please prepare FIFA 24', description: 'Optional notes from user' })
  @IsOptional()
  @IsString()
  userNotes?: string;
}
