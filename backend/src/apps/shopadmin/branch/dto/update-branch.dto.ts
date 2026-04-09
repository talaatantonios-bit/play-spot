import { PartialType } from '@nestjs/swagger';
import { ShopAdminCreateBranchDto } from './create-branch.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class ShopAdminUpdateBranchDto extends PartialType(ShopAdminCreateBranchDto) {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
