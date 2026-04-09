import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { MobileBranchService } from './branch.service';
import { BranchQueryDto } from './dto/branch-query.dto';
import { MobileBranchResponse } from './responses/branch.response';
import { PaginatedBranchResponse } from './responses/paginated-branch.response';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('mobile/branch')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('mobile/branch')
export class MobileBranchController {
  constructor(private readonly branchService: MobileBranchService) {}

  @Get('shop/:shopId')
  @ApiOperation({ summary: 'Get active branches of a shop — filter by area' })
  @ApiOkResponse({ type: PaginatedBranchResponse })
  findByShop(
    @Param('shopId') shopId: string,
    @Query() query: BranchQueryDto,
  ) {
    return this.branchService.findByShop(shopId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a branch by ID' })
  @ApiOkResponse({ type: MobileBranchResponse })
  @ApiNotFoundResponse({ description: 'Branch not found.' })
  findById(@Param('id') id: string) {
    return this.branchService.findById(id);
  }
}
