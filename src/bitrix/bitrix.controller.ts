// Nest
import { Controller, Get } from '@nestjs/common';
// Services
import { BitrixService } from './bitrix.service';

@Controller('api/v1/bitrix')
export class BitrixController {
  constructor(private readonly BitrixService: BitrixService) {}

  @Get('testGetDealsOnProviders')
  async testAuth() {
    return this.BitrixService.getDealsOnProviders(52);
  }
}
