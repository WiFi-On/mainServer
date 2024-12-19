import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ScheduleUsersRepository } from '../db1/repositories/schedule_users.repository';
import { EmployeeScheduleRepository } from 'src/db1/repositories/employee_schedule.repository';

import { ScheduleUser } from '../db1/entities/schedule_user.entity';

import * as crypto from 'crypto';

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

  async addActiveDay(idWorker: number, date: string, startWorkTime: string, endWorkTime: string, office: boolean) {
    return this.employeeScheduleRepository.addActiveDay({
      userId: idWorker,
      date,
      startTime: startWorkTime,
      endTime: endWorkTime,
      office,
    });
  }

  async checkWebAppSignature(initData: string): Promise<boolean> {
    /**
     * Проверяет валидность подписи данных от Telegram WebApp
     *
     * Источник:
     * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
     *
     * @param initData Данные, полученные от WebApp
     * @returns true, если подпись валидна, иначе user
     */
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
}
