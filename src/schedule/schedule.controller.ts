// nest
import { Body, Controller, Post, NotFoundException, HttpException, Get, Query, Delete } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
// Validations
import { AddActiveDayValidation } from './validations/active_days.validation';
import { CheckInitDataValidation } from './validations/checkInitData.validation';
import { EditStatusActiveDayValidation } from './validations/editStatusActiveDay.validation';
import { GetScheduleValidation } from './validations/getSchedule.validation';
import { DeleteActiveDayValidation } from './validations/deleteActiveDay.validation';
// ...
import { ScheduleService } from './schedule.service';
import { ScheduleUser } from '../db1/entities/schedule_user.entity';
import scheduleInterface from './interfaces/schedule.interface';

@ApiTags('Schedule')
@Controller('api/v1/schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  async getSchedule(@Query() query: GetScheduleValidation): Promise<scheduleInterface> {
    // if (!(await this.scheduleService.checkWebAppSignature(query.initData))) {
    //   throw new HttpException('Unauthorized', 401);
    // }
    try {
      return this.scheduleService.getActiveDays(query);
    } catch (error) {
      throw new HttpException('Error server: ' + error.message, 500);
    }
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

  @Post('addWorkDay')
  async addActiveDay(@Body() body: AddActiveDayValidation): Promise<any> {
    // if (!(await this.scheduleService.checkWebAppSignature(body.initData))) {
    //   throw new HttpException('Unauthorized', 401);
    // }
    try {
      const activeDay = await this.scheduleService.addActiveDay(body.initData, body.date, body.startTime, body.endTime, body.officeWork);
      console.log(activeDay);
      return activeDay;
    } catch (error) {
      throw new HttpException('Error server: ' + error.message, 500);
    }
  }

  @Delete('deleteWorkDay')
  async delActiveDay(@Body() body: DeleteActiveDayValidation): Promise<any> {
    // if (!(await this.scheduleService.checkWebAppSignature(body.initData))) {
    //   throw new HttpException('Unauthorized', 401);
    // }
    try {
      const result = await this.scheduleService.deleteActiveDay(body.id);
      return result;
    } catch (error) {
      throw new HttpException('Error server: ' + error.message, 500);
    }
  }

  // @Post('editWorkDay')
  // async editActiveDay(@Body() body: AddActiveDayValidation): Promise<any> {
  //   // if (!(await this.scheduleService.checkWebAppSignature(body.initData))) {
  //   //   throw new HttpException('Unauthorized', 401);
  //   // }
  //   try {
  //     const activeDay = await this.scheduleService.editActiveDay(body.id, body.date, body.startTime, body.endTime, body.officeWork);
  //     return activeDay;
  //   } catch (error) {
  //     throw new HttpException('Error server: ' + error.message, 500);
  //   }
  // }

  @Post('checkInitData')
  async checkInitData(@Body() body: CheckInitDataValidation): Promise<{ result: boolean }> {
    try {
      const isValid = await this.scheduleService.checkWebAppSignature(body.initData);
      return { result: isValid };
    } catch (error) {
      // Логирование ошибки, если нужно
      throw new HttpException('Error server: ' + error.message, 500);
    }
  }

  @Post('editStatusActiveDay')
  async editStatusActiveDay(@Body() body: EditStatusActiveDayValidation): Promise<any> {
    try {
      return this.scheduleService.editStatusActiveDay(body.id, body.status);
    } catch (error) {
      throw new HttpException('Error server: ' + error.message, 500);
    }
  }
}
