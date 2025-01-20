import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ScheduleUsersRepository } from '../db1/repositories/schedule_users.repository';
import { EmployeeScheduleRepository } from 'src/db1/repositories/employee_schedule.repository';

import { ScheduleUser } from '../db1/entities/schedule_user.entity';
import { GetScheduleValidation } from './validations/getSchedule.validation';
import * as crypto from 'crypto';

import InitDataObject from './interfaces/initDataObject.interface';

@Injectable()
export class ScheduleService {
  constructor(
    private readonly scheduleUsersRepository: ScheduleUsersRepository,
    private readonly employeeScheduleRepository: EmployeeScheduleRepository,
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {}

  async isUserExist(telegramId: number): Promise<ScheduleUser | null> {
    return this.scheduleUsersRepository.isUserExist(telegramId);
  }

  async addActiveDay(initData: string, date: string, startWorkTime: string, endWorkTime: string, office: boolean) {
    // const { user } = await this.parseInitDataToObject(initData);
    return this.employeeScheduleRepository.addActiveDay({
      user_id: 625835890,
      date: date,
      start_time: startWorkTime,
      end_time: endWorkTime,
      office,
      status: 'В ожидании',
    });
  }

  async deleteActiveDay(id: number) {
    return this.employeeScheduleRepository.delActiveDay(id);
  }

  async editStatusActiveDay(id: number, status: string) {
    return this.employeeScheduleRepository.editStatusActiveDay(id, status);
  }

  async parseInitDataToObject(initData: string): Promise<InitDataObject> {
    try {
      const parsedData: Record<string, string> = Object.fromEntries(new URLSearchParams(initData));

      // Приводим данные к нужному типу
      const initDataObject: InitDataObject = {
        query_id: parsedData.query_id,
        user: JSON.parse(parsedData.user),
        auth_date: parsedData.auth_date,
        signature: parsedData.signature,
        hash: parsedData.hash,
      };

      return initDataObject;
    } catch (error) {
      throw new Error('Ошибка в парсинге initData: ' + error.message);
    }
  }

  /**
   * Проверяет валидность подписи данных от Telegram WebApp
   *
   * Источник:
   * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
   *
   * @param initData Данные, полученные от WebApp
   * @returns true, если подпись валидна, иначе user
   */
  async checkWebAppSignature(initData: string): Promise<boolean> {
    try {
      const parsedData = Object.fromEntries(new URLSearchParams(initData));
      const token = this.configService.get<string>('TG_API_KEY');
      if (!parsedData.hash) {
        // Хэш отсутствует в данных
        return false;
      }

      // Извлечение хэша
      const receivedHash = parsedData.hash;
      delete parsedData.hash;

      // Формируем строку для проверки подписи
      const dataCheckString = Object.keys(parsedData)
        .sort()
        .map((key) => `${key}=${parsedData[key]}`)
        .join('\n');

      // Генерируем секретный ключ
      const secretKey = crypto.createHmac('sha256', 'WebAppData').update(token).digest();

      // Вычисляем хэш
      const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

      return receivedHash === calculatedHash;
    } catch (error) {
      console.error('Ошибка при разборе initData:', error);
      return false;
    }
  }

  async getActiveDays(filters: GetScheduleValidation): Promise<any> {
    const { office, status, startDate, endDate } = filters;

    // const { user } = await this.parseInitDataToObject(initData);
    // const idEmployee = user.id;

    return this.employeeScheduleRepository.getActiveDays({
      idEmployee: 625835890,
      office,
      status,
      startDate,
      endDate,
    });
  }
}
