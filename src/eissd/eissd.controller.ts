// Nest
import { Controller, Get } from '@nestjs/common';

// Services
import { EissdService } from './eissd.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('eissd')
@Controller('api/v1/eissd')
export class EissdController {
  // private readonly logger = new Logger(EissdController.name);
  constructor(private readonly EissdService: EissdService) {}

  // @Get('getTHV')
  // @ApiOperation({ summary: 'Получение тарифа по ID' })
  // @ApiOkResponse({ description: 'Успешное получение тарифа', type: ThvArrayDTO })
  // @ApiNotFoundResponse({ description: 'Тариф не найден', type: noThvDTO })
  // async getTHV(@Query() query: GetThvValidation, @Req() request: Request, @Res() res: Response) {
  //   const clientIp = request.ip || request.socket.remoteAddress;
  //   const requestPath = request.originalUrl; // Получаем полный путь запроса
  //   const startTime = Date.now(); // Запоминаем время начала выполнения
  //   try {
  //     const endTime = Date.now(); // Запоминаем время завершения выполнения
  //     const executionTime = endTime - startTime; // Вычисляем время выполнения
  //     this.logger.log(`THV found. ADDRESS: ${query.address} || IP: ${clientIp} || PATH: ${requestPath} || TIME: ${executionTime} мс`);
  //     const result = await this.EissdService.checkTHV(query.address);
  //     res.status(200).json(result);
  //   } catch (error) {
  //     const endTime = Date.now(); // Запоминаем время завершения выполнения
  //     const executionTime = endTime - startTime; // Вычисляем время выполнения
  //     this.logger.error(`THV not found. ADDRESS: ${query.address} || IP: ${clientIp} || PATH: ${requestPath} || TIME: ${executionTime} мс`);
  //     res.status(404).json({ message: error.message });
  //   }
  // }

  @Get('getTHV')
  async getTHV() {
    return this.EissdService.checkTHV('Широтная 105 кв. 1');
  }
  @Get('testAuth')
  async testAuth() {
    return this.EissdService.authEissd();
  }
  @Get('testInfoApplication')
  async testInfoApplication() {
    const result = await this.EissdService.getStatusesApplication('1100388451857');
    return result;
  }
  // @Get('testTHV')
  // async testTHV() {
  //   return this.EissdService.checkTHV('Широтная 105 кв. 1');
  // }
  // @Get('testOrgId')
  // async testOrgId() {
  //   return this.EissdService.getOrgId('02');
  // }
  // @Get('testSHPD')
  // async testSHPD() {
  //   return this.EissdService.getSHPDtariff('19', '2230719', 'xDSL');
  // }
  // @Get('testIPTV')
  // async testIPTV() {
  //   return this.EissdService.getIPTVtariff('38', '2233206', 'xDSL');
  // }
  // @Get('testSHPDmrf')
  // async testSHPDmrf() {
  //   return this.EissdService.getSHPDtariffMRF('72', '2983153', '3707742', '20400396', '1', 'PON');
  // }
  // @Get('testIPTVmrf')
  // async testIPTVmrf() {
  //   return this.EissdService.getIPTVtariffMRF('', '', '', '', '', '');
  // }
  // @Get('testSIM')
  // async testSIM() {
  //   return this.EissdService.getSIMtariff('38', '2004882', 'Иркутская область');
  // }
  // @Get('testSendAplication')
  // async testSendAplication() {
  //   return this.EissdService.sendAplication('', '', '', [], '', );
  // }
  // @Get('testMain')
  // async testMain() {
  //   return this.EissdService.main();
  // }
}
