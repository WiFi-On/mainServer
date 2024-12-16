// Nest
import { Controller, Req, Body, Logger, UseGuards, Post, NotFoundException } from '@nestjs/common';
import { AuthRequest } from '../auth/interfaces/request.interface';
// Guards
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActiveGuard } from '../auth/guards/active.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/role.decorator';
// Services
import { PartnerService } from './partner.service';
// DTOS
import { AddLeadValidation } from './validations/leads.validations';
import { ReturnDataLead } from './interfaces/controllers/ReturnDataLead.interface';
import { ApiTags, ApiOperation, ApiOkResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { LeadReadyDTO } from './dtos/lead.dto';

@ApiTags('Partner')
@Controller('api/v1/partner')
export class PartnerController {
  private readonly logger = new Logger(PartnerController.name);
  constructor(private readonly partnerService: PartnerService) {}

  @ApiOperation({ summary: 'Получение лидов от партнеров.' })
  @ApiOkResponse({ description: 'Получение лидов от партнеров', type: LeadReadyDTO })
  @ApiNotFoundResponse({ description: 'Файл не найден' })
  @UseGuards(JwtAuthGuard, ActiveGuard, RolesGuard)
  @Roles('partnerAvatell')
  @Post('/add/lead')
  async addLead(@Body() body: AddLeadValidation, @Req() request: AuthRequest): Promise<ReturnDataLead> {
    const clientIp = request.ip || request.socket.remoteAddress;
    const requestPath = request.originalUrl; // Получаем полный путь запроса
    const startTime = Date.now(); // Запоминаем время начала выполнения

    try {
      const { partner_id } = request.user; // Получаем id партнера из токена пользователя

      // Вызываем метод добавления лида в сервисе
      const lead = await this.partnerService.addLead(body.id, partner_id, body.fio, body.tel, body.comment, body.address);

      if (!lead) {
        const endTime = Date.now(); // Запоминаем время завершения выполнения
        const executionTime = endTime - startTime; // Вычисляем время выполнения

        this.logger.error(`Lead not created. IdPartner: ${partner_id} || IdLead: ${body.id} || IP: ${clientIp} || PATH: ${requestPath} || TIME: ${executionTime} мс`);
        throw new NotFoundException(`Lead not created. ID: ${body.id}`);
      }

      const endTime = Date.now(); // Запоминаем время завершения выполнения
      const executionTime = endTime - startTime; // Вычисляем время выполнения

      this.logger.log(
        `Lead created. Partner: ${lead.client.partner.name} || IdBitrixClient: ${lead.idClientBitrix} || IdBitrixLead: ${lead.idLeadBitrix} || ID lead: ${body.id} || IP: ${clientIp} || PATH: ${requestPath} || TIME: ${executionTime} мс`,
      );

      return {
        id: body.id,
        result: 'Заявка занесена',
      };
    } catch (error) {
      const endTime = Date.now(); // Запоминаем время завершения выполнения в случае ошибки
      const executionTime = endTime - startTime; // Вычисляем время выполнения

      this.logger.error(`Error during lead creation. IP: ${clientIp} || PATH: ${requestPath} || TIME: ${executionTime} мс`, error.stack);
      throw error;
    }
  }
}
