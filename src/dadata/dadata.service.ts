import { Injectable } from '@nestjs/common';

import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class DadataService {
  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async addressCheck(address: string): Promise<any> {
    const apiKey = this.configService.get<string>('DADATA_KEY');
    const url =
      'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address';
    const headers = {
      Authorization: `Token ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, { query: address }, { headers }),
      );

      const data = response.data;

      if (!data.suggestions || data.suggestions.length === 0) {
        return false;
      }

      return data.suggestions[0].value;
    } catch (error) {
      console.error('Ошибка при проверке адреса:', error);
      return false;
    }
  }

  async getDistrictFiasIDonIP(ip: string): Promise<string> {
    const apiKey = this.configService.get<string>('DADATA_API_KEY');
    const url =
      'http://suggestions.dadata.ru/suggestions/api/4_1/rs/iplocate/address';

    const headers = {
      Authorization: `Token ${apiKey}`,
      'Content-Type': 'application/json',
    };
    const body = {
      ip: ip,
    };
    try {
      const response = await firstValueFrom(
        this.httpService.post(url, body, { headers }),
      );

      const data = response.data;
      const districtId = data.location.fias_id;
      return districtId;
    } catch (error) {
      console.error('Ошибка при выполнении запроса:', error);
      throw new Error('Не удалось получить данные района');
    }
  }
}
