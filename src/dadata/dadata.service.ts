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
