// nest
import { Body, Controller, Post, HttpException, Get, Query, Delete, Put, UseGuards } from '@nestjs/common';
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

@Controller('api/v1/schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @UseGuards(WebAppSignature)
  @Get()
  async getSchedule(@Query() query: GetScheduleDto): Promise<scheduleInterface> {
    try {
      return this.scheduleService.getActiveDays(query);
    } catch (error) {
      throw new HttpException('Error server: ' + error.message, 500);
    }
  }

  @Post('checkUser')
  async checkUser(
    @Body() body: CheckInitDataDto, // Получаем telegramId из тела запроса
  ): Promise<{ result: string | null }> {
    try {
      const result = await this.scheduleService.isUserExist(body.initData);
      const role = result ? ((await this.scheduleService.isAdmin(body.initData)) ? 'admin' : 'user') : null;

      return { result: role };
    } catch (error) {
      throw new HttpException('Error server: ' + error.message, 500);
    }
  }

  @UseGuards(WebAppSignature)
  @Post('add/WorkDay')
  async addActiveDay(@Body() body: AddActiveDayDto): Promise<any> {
    try {
      const initData = Headers['x-init-data'];
      const activeDay = await this.scheduleService.addActiveDay(initData, body.date, body.startTime, body.endTime, body.officeWork);
      return activeDay;
    } catch (error) {
      throw new HttpException('Error server: ' + error.message, 500);
    }
  }

  @UseGuards(WebAppSignature, CheckUserPermission)
  @Delete('delete/WorkDay')
  async delActiveDay(@Body() body: DeleteActiveDayDto): Promise<any> {
    try {
      const result = await this.scheduleService.deleteActiveDay(body.id);
      return result;
    } catch (error) {
      throw new HttpException('Error server: ' + error.message, 500);
    }
  }

  @UseGuards(WebAppSignature, CheckUserPermission)
  @Put('update/WorkDay')
  async editWorkDay(@Body() body: EditActiveDayDto): Promise<any> {
    try {
      const activeDay = await this.scheduleService.editWorkDay(body);
      return activeDay;
    } catch (error) {
      throw new HttpException('Error server: ' + error.message, 500);
    }
  }

  @UseGuards(Admin, WebAppSignature)
  @Put('update/statusWorkDay')
  async editStatusWorkDay(@Body() body: EditStatusActiveDayDto): Promise<any> {
    try {
      const activeDay = await this.scheduleService.editStatusWorkDay(body);
      return activeDay;
    } catch (error) {
      throw new HttpException('Error server: ' + error.message, 500);
    }
  }
}
