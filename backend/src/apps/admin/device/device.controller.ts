import {
  Controller,
  Post,
  Get,
  Put,
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
  ApiBodyOptions,
  ApiQuery,
} from '@nestjs/swagger';
import { AdminDeviceService } from './device.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { DeviceResponse } from './responses/device.response';
import { PaginatedDeviceResponse } from './responses/paginated-device.response';
import { JwtAuthGuard } from '../../mobile/auth/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../enums/role.enum';
import { CreateDeviceSwaggerBody, UpdateDeviceSwaggerBody } from './device.swagger';


@ApiTags('admin/device')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.SHOP_ADMIN)
@Controller('admin/device')
export class AdminDeviceController {
  constructor(private readonly deviceService: AdminDeviceService) {}

  @Post('shop/:shopId/branch/:branchId')
  @ApiOperation({ summary: 'Create a device' })
  @ApiConsumes('multipart/form-data')
  @ApiCreatedResponse({ type: DeviceResponse })
  @ApiNotFoundResponse({ description: 'Shop or Branch not found' })
  @ApiBody(CreateDeviceSwaggerBody as ApiBodyOptions)
  @UseInterceptors(FileInterceptor('image'))
  createDevice(
    @Param('shopId') shopId: string,
    @Param('branchId') branchId: string,
    @Body() dto: CreateDeviceDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.deviceService.createDevice(shopId, branchId, dto, image);
  }

  @Get('branch/:branchId')
  @ApiOperation({ summary: 'List all devices in a branch' })
  @ApiOkResponse({ type: PaginatedDeviceResponse })
  @ApiNotFoundResponse({ description: 'Branch not found' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  listDevices(
    @Param('branchId') branchId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.deviceService.listDevices(branchId, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a device by ID' })
  @ApiOkResponse({ type: DeviceResponse })
  @ApiNotFoundResponse({ description: 'Device not found' })
  getDevice(@Param('id') id: string) {
    return this.deviceService.getDevice(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a device' })
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({ type: DeviceResponse })
  @ApiNotFoundResponse({ description: 'Device not found' })
  @ApiBody(UpdateDeviceSwaggerBody as ApiBodyOptions)
  @UseInterceptors(FileInterceptor('image'))
  updateDevice(
    @Param('id') id: string,
    @Body() dto: UpdateDeviceDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.deviceService.updateDevice(id, dto, image);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a device' })
  @ApiOkResponse({ description: 'Device deleted successfully' })
  @ApiNotFoundResponse({ description: 'Device not found' })
  deleteDevice(@Param('id') id: string) {
    return this.deviceService.deleteDevice(id);
  }
}
