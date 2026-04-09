import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class BlockShopDto {
  @ApiPropertyOptional({ example: 'Violated terms of service' })
  @IsOptional()
  @IsString()
  reason?: string;
}
