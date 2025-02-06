// Nest
import { Controller, Req, Body, UseGuards, Post, NotFoundException } from '@nestjs/common';
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
import { LoggerService } from 'src/logger/logger.service';

@ApiTags('Partner')
@Controller('api/v1/partner')
export class PartnerController {
  constructor(
    private readonly partnerService: PartnerService,
    private readonly logger: LoggerService,
  ) {}

  @ApiOperation({ summary: 'Получение лидов от партнеров.' })
  @ApiOkResponse({ description: 'Получение лидов от партнеров', type: LeadReadyDTO })
  @ApiNotFoundResponse({ description: 'Файл не найден' })
  @UseGuards(JwtAuthGuard, ActiveGuard, RolesGuard)
  @Roles('partnerAvatell')
  @Post('/add/lead')
  async addLead(@Body() body: AddLeadValidation, @Req() request: AuthRequest): Promise<ReturnDataLead> {
    const clientIp = request.ip || request.socket.remoteAddress;
    const startTime = Date.now(); // Запоминаем время начала выполнения

    try {
      const { partner_id } = request.user; // Получаем id партнера из токена пользователя

      // Вызываем метод добавления лида в сервисе
      const lead = await this.partnerService.addLead(body.id, partner_id, body.fio, body.tel, body.comment, body.address);

      if (!lead) {
        this.logger.error(`Ошибка при добавлении лида. Партнер: ${lead.client.partner.name} `, 'PartnerController/addLead', 'Ошибка при добавлении лида', {
          idPartner: partner_id,
          idLead: body.id,
          ip: clientIp,
          time: `${Date.now() - startTime} мс`,
        });
        throw new NotFoundException(`Lead not created. ID: ${body.id}`);
      }

      this.logger.log(`Лид успешно добавлен. Partner: ${lead.client.partner.name}`, 'PartnerController/addLead', {
        idPartner: partner_id,
        idLead: body.id,
        ip: clientIp,
        time: `${Date.now() - startTime} мс`,
      });

      return {
        id: body.id,
        result: 'Заявка занесена',
      };
    } catch (error) {
      this.logger.error(`Ошибка в добавлении лида. Партнер: ${body.id}`, 'PartnerController/addLead', error.message, {
        idPartner: body.id,
        idLead: body.id,
        ip: clientIp,
        time: `${Date.now() - startTime} мс`,
      });
      throw error;
    }
  }
}
