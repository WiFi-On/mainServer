import { Injectable } from '@nestjs/common';

import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import { AddressResponseDadataI } from './interfaces';

@Injectable()
export class DadataService {
  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  /**
   * Получение подробной информации об адресе из сервиса dadata по адресу.
   *
   * @param {string} [address=''] - Адрес.
   * @returns {Promise<AddressResponseDadataI | null>} Объект с информацией об адресе или null, если адрес не найден. В объекте содержатся не все поля.
   *
   * @throws {HttpException} Выбрасывается в случае ошибки HTTP-запроса с описанием причины.
   *
   * @example
   * const address = await dadataService.addressCheck('Москва, ул. Ленина 1 кв 1');
   * console.log(address);
   */
  async addressCheck(address: string): Promise<AddressResponseDadataI | null> {
    const apiKey = this.configService.get<string>('DADATA_KEY');
    const url = 'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address';
    const headers = {
      Authorization: `Token ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    try {
      // Делаем запрос к Dadata API
      const response = await firstValueFrom(this.httpService.post(url, { query: address }, { headers }));

      const data: AddressResponseDadataI = response.data;

      // Проверяем, есть ли предложения
      if (!data.suggestions || data.suggestions.length === 0) {
        return null;
      }

      return data;
    } catch (error) {
      console.error('Ошибка при проверке адреса:', error);
      return null;
    }
  }

  /**
   * Получение подробной информации об адресе из сервиса dadata по ip. Используется для определения местоположение пользователя.
   *
   * @param {string} [ip=''] - ip.
   * @returns {Promise<string>} Возвращает фиас айди населенного пункта или пустую строку.
   *
   * @throws {HttpException} Выбрасывается в случае ошибки HTTP-запроса с описанием причины.
   *
   * @example
   * const fiasDistrictId = await dadataService.getDistrictFiasIDonIP('127.0.0.1');
   * console.log(fiasDistrictId);
   */
  async getDistrictFiasIDonIP(ip: string): Promise<string> {
    const apiKey = this.configService.get<string>('DADATA_KEY');
    const url = 'http://suggestions.dadata.ru/suggestions/api/4_1/rs/iplocate/address';

    const headers = {
      Authorization: `Token ${apiKey}`,
      'Content-Type': 'application/json',
    };
    const body = {
      ip: ip,
    };
    try {
      const response = await firstValueFrom(this.httpService.post(url, body, { headers }));

      const data = response.data;
      const districtId = data.location.fias_id;
      return districtId;
    } catch (error) {
      console.error('Ошибка при выполнении запроса:', error);
      throw new Error('Не удалось получить данные района');
    }
  }
}
