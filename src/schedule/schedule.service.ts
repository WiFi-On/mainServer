// nest
import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// utils
import * as crypto from 'crypto';
// repo
import { ScheduleUsersRepository } from '../db1/repositories/schedule_users.repository';
import { EmployeeScheduleRepository } from 'src/db1/repositories/employee_schedule.repository';
//dtos
import { GetScheduleDto } from './dtos/getSchedule.dto';
import { EditActiveDayDto } from './dtos/editActiveDay.dto';
import { EditStatusActiveDayDto } from './dtos/editStatusActiveDay.dto';
// interfaces
import InitDataObject from './interfaces/initDataObject.interface';

@Injectable()
export class ScheduleService {
  constructor(
    private readonly scheduleUsersRepository: ScheduleUsersRepository,
    private readonly employeeScheduleRepository: EmployeeScheduleRepository,
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {}

  async isUserExist(initData: string): Promise<boolean> {
    const initDataObject = await this.parseInitDataToObject(initData);
    const telegramId = initDataObject.user.id;
    const result = this.scheduleUsersRepository.isUserExist(telegramId);

    return !!result;
  }

  async isAdmin(initData: string): Promise<boolean> {
    try {
      const initDataObject = await this.parseInitDataToObject(initData);
      const telegramId = initDataObject.user.id;
      const result = await this.scheduleUsersRepository.isUserExist(telegramId);

      return result.admin;
    } catch (error) {
      throw new Error('Ошибка при проверке админа: ' + error.message);
    }
  }

  async addActiveDay(initData: string, date: string, startWorkTime: string, endWorkTime: string, office: boolean) {
    const { user } = await this.parseInitDataToObject(initData);
    return this.employeeScheduleRepository.addActiveDay({
      user_id: user.id,
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

  async checkUserActiveDayId(idActiveDay: number, initData: string): Promise<boolean> {
    const { user } = await this.parseInitDataToObject(initData);
    const object = await this.employeeScheduleRepository.getUserIdByTelegramId(user.id);

    return user.id === object.user_id;
  }

  async editWorkDay(dto: EditActiveDayDto) {
    const { id, startTime, endTime, officeWork } = dto;
    return this.employeeScheduleRepository.editActiveDay(id, startTime, endTime, officeWork);
  }

  async editStatusWorkDay(dto: EditStatusActiveDayDto) {
    const { id, status } = dto;
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
      throw new Error('Ошибка при проверке InitData: ' + error.message);
    }
  }

  async getActiveDays(filters: GetScheduleDto): Promise<any> {
    const { office, status, startDate, endDate, dateObject } = filters;

    // const { user } = await this.parseInitDataToObject(initData);
    // const idEmployee = user.id;

    const result = await this.employeeScheduleRepository.getActiveDays({
      idEmployee: 625835890,
      office,
      status,
      startDate,
      endDate,
    });

    if (dateObject) {
      const groupedByDate = result.reduce((acc, schedule) => {
        const date = schedule.date;
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(schedule);
        return acc;
      }, {});

      return groupedByDate;
    }

    return result;
  }
}
