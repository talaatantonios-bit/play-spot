import { PartialType } from '@nestjs/swagger';
import { CreateShopDto } from './create-shop.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateShopDto extends PartialType(CreateShopDto) {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
