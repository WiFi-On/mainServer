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
  async editActiveDay(id: number, startTime?: string, endTime?: string, office?: boolean): Promise<any> {
    return await this.activeDayRepository.update({ id }, { start_time: startTime, end_time: endTime, office });
  }
  async getActiveDays(filters: {
    idEmployee?: string;
    date?: string;
    office?: boolean;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<EmployeeSchedule[]> {
    const queryBuilder = this.activeDayRepository.createQueryBuilder('schedule');

    // Добавляем условия фильтрации
    if (filters.idEmployee) {
      queryBuilder.andWhere('schedule.user_id = :idEmployee', { idEmployee: filters.idEmployee });
    }

    if (filters.date) {
      queryBuilder.andWhere('schedule.date = :date', { date: filters.date });
    }

    if (filters.office !== undefined) {
      queryBuilder.andWhere('schedule.office = :office', { office: filters.office });
    }

    if (filters.status) {
      queryBuilder.andWhere('schedule.status = :status', { status: filters.status });
    }

    if (filters.startDate || filters.endDate) {
      if (filters.startDate) {
        queryBuilder.andWhere('schedule.date >= :startDate', { startDate: filters.startDate });
      }
      if (filters.endDate) {
        queryBuilder.andWhere('schedule.date <= :endDate', { endDate: filters.endDate });
      }
    }

    // Подгружаем данные пользователя, используя связь с таблицей schedule_users
    queryBuilder.leftJoinAndSelect('schedule.user', 'user'); // указываем, что нужно подгрузить связанного пользователя

    // Добавляем сортировку по дате
    queryBuilder.orderBy('schedule.date', 'ASC');

    // Выполняем запрос и возвращаем данные
    return queryBuilder.getMany();
  }
  async delActiveDay(id: number): Promise<any> {
    return await this.activeDayRepository.delete({ id });
  }
  async getUserIdByTelegramId(telegramId: string): Promise<EmployeeSchedule> {
    return await this.activeDayRepository.findOne({ where: { user_id: telegramId } });
  }
}
