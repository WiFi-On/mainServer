import { Body, Controller, Post, NotFoundException, HttpException, BadRequestException, Get, Query } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleUser } from '../db1/entities/schedule_user.entity';
import { AddActiveDayValidation } from './validations/active_days.validation';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CheckInitDataValidation } from './validations/checkInitData.validation';
import { EditStatusActiveDayValidation } from './validations/editStatusActiveDay.validation';
import { GetScheduleValidation } from './validations/getSchedule.validation';

@ApiTags('Schedule')
@Controller('api/v1/schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  async getSchedule(@Query() query: GetScheduleValidation): Promise<any> {
    return this.scheduleService.getActiveDays(query);
  }

  @ApiOperation({ summary: 'Проверка существования пользователя по телеграмм айди.' })
  @Post('checkUser')
  async checkUser(
    @Body() body: { telegramId: number }, // Получаем telegramId из тела запроса
  ): Promise<ScheduleUser> {
    // Проверка существования пользователя по telegramId
    const user = await this.scheduleService.isUserExist(body.telegramId);

    if (user) {
      return user;
    } else {
      throw new NotFoundException('User not found'); // Если пользователь не найден, выбрасываем ошибку
    }
  }

  @ApiOperation({ summary: 'Добавление рабочего дня' })
  @Post('addWorkDay')
  async addActiveDay(@Body() body: AddActiveDayValidation): Promise<any> {
    console.log(body);
    try {
      if (!(await this.scheduleService.checkWebAppSignature(body.initData))) {
        throw new HttpException('Unauthorized', 401);
      }
      const activeDay = await this.scheduleService.addActiveDay(body.initData, body.date, body.startTime, body.endTime, body.officeWork);
      throw new HttpException(activeDay, 201);
    } catch (error) {
      throw new HttpException('Error server: ' + error.message, 500);
    }
  }

  @Post('checkInitData')
  async checkInitData(@Body() body: CheckInitDataValidation): Promise<{ result: boolean }> {
    try {
      const isValid = await this.scheduleService.checkWebAppSignature(body.initData);
      return { result: isValid };
    } catch {
      // Логирование ошибки, если нужно
      throw new BadRequestException('Invalid initData');
    }
  }

  @Post('editStatusActiveDay')
  async editStatusActiveDay(@Body() body: EditStatusActiveDayValidation): Promise<any> {
    return this.scheduleService.editStatusActiveDay(body.id, body.status);
  }
}
