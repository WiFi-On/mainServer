// Nest
import { Controller, Get } from '@nestjs/common';
// Services
import { EissdService } from './eissd.service';
// Entities

@Controller('api/v1/eissd')
export class EissdController {
  constructor(private readonly EissdService: EissdService) {}

  @Get('testAuth')
  async getHello() {
    return this.EissdService.authEissd();
  }
}
