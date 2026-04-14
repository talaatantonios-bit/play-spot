import { ApiProperty } from '@nestjs/swagger';
import { MobileDeviceResponse } from './mobile-device.response';

export class DeviceListResponse {
  @ApiProperty({ type: [MobileDeviceResponse] })
  data: MobileDeviceResponse[];

  @ApiProperty({ example: 8 })
  total: number;
}
