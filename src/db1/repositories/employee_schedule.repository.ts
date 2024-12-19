import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EmployeeSchedule } from '../entities/employee_schedule.entity';

@Injectable()
export class EmployeeScheduleRepository {
  constructor(
    @InjectRepository(EmployeeSchedule)
    private readonly activeDayRepository: Repository<EmployeeSchedule>,
  ) {}

  async addActiveDay(newActiveDayData: Partial<EmployeeSchedule>): Promise<EmployeeSchedule> {
    const newActiveDay = this.activeDayRepository.create(newActiveDayData);
    return await this.activeDayRepository.save(newActiveDay);
  }
}
