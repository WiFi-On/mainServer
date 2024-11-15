import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ActiveDay } from '../entities/active_day.entity';

@Injectable()
export class ActiveDaysRepository {
  constructor(
    @InjectRepository(ActiveDay)
    private readonly activeDayRepository: Repository<ActiveDay>,
  ) {}

  async addActiveDay(newActiveDayData: Partial<ActiveDay>): Promise<ActiveDay> {
    const newActiveDay = this.activeDayRepository.create(newActiveDayData);
    return await this.activeDayRepository.save(newActiveDay);
  }
}
