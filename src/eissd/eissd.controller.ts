// Nest
import { Controller, Get, Query, Req, Logger, Res } from '@nestjs/common';
import { Request, Response } from 'express';
// Services
import { EissdService } from './eissd.service';
// Validations
import { GetThvValidation } from './validations/getTHV.validation';
// Swagger
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
// DTOS
import { ThvArrayDTO, noThvDTO } from './dtos/thv.dto';

@Controller('api/v1/eissd')
export class EissdController {
  private readonly logger = new Logger(EissdController.name);
  constructor(private readonly EissdService: EissdService) {}

  @Get('getTHV')
  @ApiOperation({ summary: 'Получение тарифа по ID' })
  @ApiOkResponse({ description: 'Успешное получение тарифа', type: ThvArrayDTO })
  @ApiNotFoundResponse({ description: 'Тариф не найден', type: noThvDTO })
  async getTHV(@Query() query: GetThvValidation, @Req() request: Request, @Res() res: Response) {
    const clientIp = request.ip || request.socket.remoteAddress;
    const requestPath = request.originalUrl; // Получаем полный путь запроса
    const startTime = Date.now(); // Запоминаем время начала выполнения
    try {
      const endTime = Date.now(); // Запоминаем время завершения выполнения
      const executionTime = endTime - startTime; // Вычисляем время выполнения
      this.logger.log(
        `THV found. ADDRESS: ${query.address} || IP: ${clientIp} || PATH: ${requestPath} || TIME: ${executionTime} мс`,
      );
      const result = await this.EissdService.checkTHV(query.address);
      res.status(200).json(result);
    } catch (error) {
      const endTime = Date.now(); // Запоминаем время завершения выполнения
      const executionTime = endTime - startTime; // Вычисляем время выполнения
      this.logger.error(
        `THV not found. ADDRESS: ${query.address} || IP: ${clientIp} || PATH: ${requestPath} || TIME: ${executionTime} мс`,
      );
      res.status(404).json({ message: error.message });
    }
  }

  @Get('testAuth')
  async testAuth() {
    return this.EissdService.authEissd();
  }
}
