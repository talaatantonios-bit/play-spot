import { ApiProperty } from '@nestjs/swagger';
import { DeviceResponse } from './device.response';

export class PaginatedDeviceResponse {
  @ApiProperty({ type: [DeviceResponse] })
  data: DeviceResponse[];

  @ApiProperty({ example: 25 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 3 })
  totalPages: number;
}
