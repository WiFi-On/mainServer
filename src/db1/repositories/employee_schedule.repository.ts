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
  async editStatusActiveDay(id: number, status: string): Promise<any> {
    return await this.activeDayRepository.update({ id }, { status });
  }

  // async getActiveDays(idEmployee?: number, office?: boolean, status?: string, startDate?: string, endDate?: string): Promise<any> {
  //   return await this.activeDayRepository.find({
  //     where: {
  //       user_id: idEmployee,
  //       office,
  //       status,
  //       date: {
  //         gte: startDate,
  //         lte: endDate,
  //       },
  //     },
  //   });
  // }
}
