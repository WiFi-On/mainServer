// nest
import { Body, Headers, Controller, Post, Req, HttpException, Get, Query, Delete, Put, UseGuards } from '@nestjs/common';
import { Request } from 'express';
// Validations
import { AddActiveDayDto } from './dtos/active_days.dto';
import { EditActiveDayDto } from './dtos/editActiveDay.dto';
import { GetScheduleDto } from './dtos/getSchedule.dto';
import { DeleteActiveDayDto } from './dtos/deleteActiveDay.dto';
import { EditStatusActiveDayDto } from './dtos/editStatusActiveDay.dto';
import { CheckInitDataDto } from './dtos/checkInitData.dto';
// ...
import { ScheduleService } from './schedule.service';
import scheduleInterface from './interfaces/schedule.interface';
import { Admin } from './guards/Admin.guard';
import { WebAppSignature } from './guards/WebAppSignature.guard';
import { CheckUserPermission } from './guards/CheckUserPermission.guard';
import { LoggerService } from 'src/logger/logger.service';

@Controller('api/v1/schedule')
export class ScheduleController {
  constructor(
    private readonly scheduleService: ScheduleService,
    private readonly logger: LoggerService,
  ) {}

  @UseGuards(WebAppSignature)
  @Get()
  async getSchedule(@Query() query: GetScheduleDto, @Headers('x-init-data') initData: string, @Req() request: Request): Promise<scheduleInterface[]> {
    const clientIp = request.ip || request.socket.remoteAddress;
    const startTime = Date.now();

    try {
      const result = await this.scheduleService.getActiveDays(initData, query);
      this.logger.log(`Рабочие дни получены.`, 'ScheduleController/getSchedule', { ip: clientIp, time: `${Date.now() - startTime} мс` });
      return result;
    } catch (error) {
      this.logger.error(`Ошибка при получении рабочих дней`, 'ScheduleController/getSchedule', error.message, { ip: clientIp, time: `${Date.now() - startTime} мс` });
      throw new HttpException('Error server: ' + error.message, 500);
    }
  }

  @Post('checkUser')
  async checkUser(@Body() body: CheckInitDataDto, @Req() request: Request): Promise<{ result: string | null }> {
    const clientIp = request.ip || request.socket.remoteAddress;
    const startTime = Date.now();

    try {
      const result = await this.scheduleService.isUserExist(body.initData);
      const role = result ? ((await this.scheduleService.isAdmin(body.initData)) ? 'admin' : 'user') : null;

      this.logger.log(`Проверка пользователя выполнена.`, 'ScheduleController/checkUser', { ip: clientIp, time: `${Date.now() - startTime} мс` });
      return { result: role };
    } catch (error) {
      this.logger.error(`Ошибка при проверке пользователя`, 'ScheduleController/checkUser', error.message, { ip: clientIp, time: `${Date.now() - startTime} мс` });
      throw new HttpException('Error server: ' + error.message, 500);
    }
  }

  @UseGuards(WebAppSignature)
  @Post('add/WorkDay')
  async addActiveDay(@Body() body: AddActiveDayDto, @Headers('x-init-data') initData: string, @Req() request: Request): Promise<any> {
    const clientIp = request.ip || request.socket.remoteAddress;
    const startTime = Date.now();

    try {
      const activeDay = await this.scheduleService.addActiveDay(initData, body.date, body.startTime, body.endTime, body.officeWork);
      this.logger.log(`Рабочий день успешно добавлен`, 'ScheduleController/addActiveDay', { ip: clientIp, time: `${Date.now() - startTime} мс` });
      return activeDay;
    } catch (error) {
      this.logger.error(`Ошибка при добавлении рабочего дня`, 'ScheduleController/addActiveDay', error.message, {
        ip: clientIp,
        time: `${Date.now() - startTime} мс`,
      });
      throw new HttpException('Error server: ' + error.message, 500);
    }
  }

  @UseGuards(WebAppSignature, CheckUserPermission)
  @Delete('delete/WorkDay')
  async delActiveDay(@Body() body: DeleteActiveDayDto, @Req() request: Request): Promise<any> {
    const clientIp = request.ip || request.socket.remoteAddress;
    const startTime = Date.now();

    try {
      const result = await this.scheduleService.deleteActiveDay(body.id);
      this.logger.log(`Рабочий день успешно удален`, 'ScheduleController/delActiveDay', { ip: clientIp, time: `${Date.now() - startTime} мс` });
      return result;
    } catch (error) {
      this.logger.error(`Ошибка при удалении рабочего дня`, 'ScheduleController/delActiveDay', error.message, { ip: clientIp, time: `${Date.now() - startTime} мс` });
      throw new HttpException('Error server: ' + error.message, 500);
    }
  }

  @UseGuards(WebAppSignature, CheckUserPermission)
  @Put('update/WorkDay')
  async editWorkDay(@Body() body: EditActiveDayDto, @Req() request: Request): Promise<any> {
    const clientIp = request.ip || request.socket.remoteAddress;
    const startTime = Date.now();

    try {
      const activeDay = await this.scheduleService.editWorkDay(body);
      this.logger.log(`Рабочий день успешно изменен`, 'ScheduleController/editWorkDay', { ip: clientIp, time: `${Date.now() - startTime} мс` });
      return activeDay;
    } catch (error) {
      this.logger.error(`Ошибка в изменении рабочего дня`, 'ScheduleController/editWorkDay', error.message, { ip: clientIp, time: `${Date.now() - startTime} мс` });
      throw new HttpException('Error server: ' + error.message, 500);
    }
  }

  @UseGuards(Admin, WebAppSignature)
  @Put('update/statusWorkDay')
  async editStatusWorkDay(@Body() body: EditStatusActiveDayDto, @Req() request: Request): Promise<any> {
    const clientIp = request.ip || request.socket.remoteAddress;
    const startTime = Date.now();

    try {
      const activeDay = await this.scheduleService.editStatusWorkDay(body);
      this.logger.log(`Статус рабочего дня успешно изменен`, 'ScheduleController/editStatusWorkDay', { ip: clientIp, time: `${Date.now() - startTime} мс` });
      return activeDay;
    } catch (error) {
      this.logger.error(`Ошибка в изменении статуса рабочего дня`, 'ScheduleController/editStatusWorkDay', error.message, {
        ip: clientIp,
        time: `${Date.now() - startTime} мс`,
      });
      throw new HttpException('Error server: ' + error.message, 500);
    }
  }
}
