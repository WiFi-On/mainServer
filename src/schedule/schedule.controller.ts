import { Body, Controller, Post, NotFoundException } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleUser } from '../db1/entities/schedule_user.entity';
import { ActiveDay } from '../db1/entities/active_day.entity';
import { AddActiveDayValidation } from './validations/active_days.validation';

@Controller('api/v1/schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post('checkUser') // Используем POST для получения данных из тела запроса
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

  @Post('addActiveDay')
  async addActiveDay(@Body() body: AddActiveDayValidation): Promise<ActiveDay> {
    const activeDay = await this.scheduleService.addActiveDay(body.idWorker, body.date, body.startWorkTime, body.endWorkTime, body.office);
    if (!activeDay) {
      throw new NotFoundException('Рабочий день не создан');
    }
    return activeDay;
  }
}
