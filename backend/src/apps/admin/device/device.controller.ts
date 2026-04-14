import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { AdminDeviceService } from './device.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { DeviceResponse } from './responses/device.response';
import { PaginatedDeviceResponse } from './responses/paginated-device.response';
import { JwtAuthGuard } from '../../mobile/auth/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../enums/role.enum';

@ApiTags('admin/device')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.SHOP_ADMIN)
@Controller('admin/device')
export class AdminDeviceController {
  constructor(private readonly deviceService: AdminDeviceService) {}

  /**
   * POST /admin/device/shop/:shopId/branch/:branchId
   * Create a new device under a specific shop + branch
   */
  @Post('shop/:shopId/branch/:branchId')
  @ApiOperation({ summary: 'Create a device (SuperAdmin or ShopAdmin)' })
  @ApiConsumes('multipart/form-data')
  @ApiCreatedResponse({ type: DeviceResponse })
  @ApiNotFoundResponse({ description: 'Shop or Branch not found.' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'deviceType', 'roomHourlyPrice', 'singleHourlyPrice', 'multiplayerHourlyPrice'],
      properties: {
        name:                   { type: 'string', example: 'PS5 Room 1' },
        deviceNumber:           { type: 'string', example: 'D-001' },
        deviceType:             { type: 'string', enum: ['PS4', 'PS5', 'VIP_PS5', 'Xbox_Series_X', 'Gaming_PC'] },
        roomHourlyPrice:        { type: 'integer', example: 100 },
        singleHourlyPrice:      { type: 'integer', example: 80 },
        multiplayerHourlyPrice: { type: 'integer', example: 60 },
        isVipRoom:              { type: 'boolean', example: false },
        maxPlayers:             { type: 'integer', example: 4 },
        displayOrder:           { type: 'integer', example: 0 },
        image:                  { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('image'))
  createDevice(
    @Param('shopId') shopId: string,
    @Param('branchId') branchId: string,
    @Body() dto: CreateDeviceDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.deviceService.createDevice(shopId, branchId, dto, image);
  }

  /**
   * GET /admin/device/branch/:branchId
   * List all devices in a branch (paginated)
   */
  @Get('branch/:branchId')
  @ApiOperation({ summary: 'List all devices in a branch (SuperAdmin or ShopAdmin)' })
  @ApiOkResponse({ type: PaginatedDeviceResponse })
  @ApiNotFoundResponse({ description: 'Branch not found.' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  listDevices(
    @Param('branchId') branchId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.deviceService.listDevices(branchId, page, limit);
  }

  /**
   * GET /admin/device/:id
   * Get a single device by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a device by ID (SuperAdmin or ShopAdmin)' })
  @ApiOkResponse({ type: DeviceResponse })
  @ApiNotFoundResponse({ description: 'Device not found.' })
  getDevice(@Param('id') id: string) {
    return this.deviceService.getDevice(id);
  }

  /**
   * DELETE /admin/device/:id
   * Delete a device
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a device (SuperAdmin or ShopAdmin)' })
  @ApiOkResponse({ description: 'Device deleted successfully.' })
  @ApiNotFoundResponse({ description: 'Device not found.' })
  deleteDevice(@Param('id') id: string) {
    return this.deviceService.deleteDevice(id);
  }
}
