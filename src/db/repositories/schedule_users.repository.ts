import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ScheduleUser } from '../entities/schedule_user.entity';

@Injectable()
export class ScheduleUsersRepository {
  constructor(
    @InjectRepository(ScheduleUser)
    private readonly scheduleUserRepository: Repository<ScheduleUser>,
  ) {}

  async isUserExist(telegramId: number): Promise<ScheduleUser | null> {
    console.log(telegramId);
    const user = await this.scheduleUserRepository.findOne({
      where: { telegram_id: telegramId }, // Убедитесь, что передаете правильный параметр
    });

    console.log(user);
    return user || null; // Если пользователь не найден, возвращается null
  }
}
