import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';

@ApiTags('default')

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Health check / Hello endpoint' })
  @ApiOkResponse({ description: 'Returns a greeting string.' })
  getHello(): string {
    return this.appService.getHello();
  }
}
