import { Injectable } from '@nestjs/common';

import { ScheduleUsersRepository } from '../db1/repositories/schedule_users.repository';
import { ActiveDaysRepository } from '../db1/repositories/active_days.repository';

import { ScheduleUser } from '../db1/entities/schedule_user.entity';

@Injectable()
export class ScheduleService {
  constructor(
    private readonly scheduleUsersRepository: ScheduleUsersRepository,
    private readonly activeDaysRepository: ActiveDaysRepository,
  ) {}

  async isUserExist(telegramId: number): Promise<ScheduleUser | null> {
    return this.scheduleUsersRepository.isUserExist(telegramId);
  }

  async addActiveDay(
    idWorker: number,
    date: string,
    startWorkTime: string,
    endWorkTime: string,
    office: boolean,
  ) {
    return this.activeDaysRepository.addActiveDay({
      date,
      startWorkTime,
      endWorkTime,
      office,
      idWorker,
    });
  }
}
