import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { MobileBranchService } from './branch.service';
import { BranchQueryDto } from './dto/branch-query.dto';
import { MobileBranchResponse } from './responses/branch.response';
import { PaginatedBranchResponse } from './responses/paginated-branch.response';
import { DeviceListResponse } from './responses/device-list.response';
import { MobileDeviceResponse } from './responses/mobile-device.response';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('mobile/branch')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('mobile/branch')
export class MobileBranchController {
  constructor(private readonly branchService: MobileBranchService) {}

  @Get()
  @ApiOperation({ summary: 'Get active branches of a shop — filter by area' })
  @ApiOkResponse({ type: PaginatedBranchResponse })
  findByShop(@Query() query: BranchQueryDto) {
    return this.branchService.findByShop(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a branch by ID' })
  @ApiOkResponse({ type: MobileBranchResponse })
  @ApiNotFoundResponse({ description: 'Branch not found.' })
  findById(@Param('id') id: string) {
    return this.branchService.findById(id);
  }

  /**
   * GET /mobile/branch/:branchId/devices
   * Get all active devices for a branch
   */
  @Get(':branchId/devices')
  @ApiOperation({ summary: 'Get all devices in a branch' })
  @ApiOkResponse({ type: DeviceListResponse })
  @ApiNotFoundResponse({ description: 'Branch not found.' })
  findBranchDevices(@Param('branchId') branchId: string) {
    return this.branchService.findBranchDevices(branchId);
  }

  /**
   * GET /mobile/branch/:branchId/device/:deviceId
   * Get a specific device with all its linked games
   */
  @Get(':branchId/device/:deviceId')
  @ApiOperation({ summary: 'Get a specific device in a branch with its games' })
  @ApiOkResponse({ type: MobileDeviceResponse })
  @ApiNotFoundResponse({ description: 'Branch or Device not found.' })
  findDeviceWithGames(
    @Param('branchId') branchId: string,
    @Param('deviceId') deviceId: string,
  ) {
    return this.branchService.findDeviceWithGames(branchId, deviceId);
  }
}
