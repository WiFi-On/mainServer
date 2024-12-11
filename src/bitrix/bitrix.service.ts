import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs'; // Для обработки Observable
import * as querystring from 'querystring'; // Для кодирования параметров URL
import { BitrixContactData } from './interfaces/BitrixContactData.interface';
import { BitrixDealData } from './interfaces/BitrixDealData.interface';
import { BitrixReturnData } from './interfaces/BitrixReturnData.interface';
import { BitrixReturnInfoData } from './interfaces/BitrixReturnInfoData.interface';

@Injectable()
export class BitrixService {
  private readonly methodCreateContact = 'crm.contact.add';
  private readonly methodCreateDeal = 'crm.deal.add';
  private readonly methodGetDeals = 'crm.deal.list';
  private readonly dealUpdate = 'crm.deal.update';
  private readonly bitrixHook: string;

  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.bitrixHook = this.configService.get<string>('BITRIX_HOOK');
    if (!this.bitrixHook) {
      throw new Error('BITRIX_HOOK is not defined in environment variables');
    }
  }

  async createContact(name: string = '', secondName: string = '', lastName: string = '', phone: string = '', address: string = ''): Promise<BitrixReturnData> {
    const url = `${this.bitrixHook}/${this.methodCreateContact}`;
    const data: BitrixContactData = {
      fields: {
        NAME: name,
        SECOND_NAME: secondName,
        LAST_NAME: lastName,
        PHONE: [{ VALUE: phone, VALUE_TYPE: 'WORK' }],
        ADDRESS: address,
      },
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, data, {
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      return response.data;
    } catch (error) {
      throw new HttpException(`Failed to create contact: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  async createDeal(id_client: number, id_distributor: number, address: string, comment: string, id_lead: number): Promise<BitrixReturnData> {
    const url = `${this.bitrixHook}/${this.methodCreateDeal}`;
    const data: BitrixDealData = {
      fields: {
        TITLE: 'Заявка от партнера',
        CONTACT_ID: id_client,
        SOURCE_ID: id_distributor,
        UF_CRM_1697646751446: address,
        COMMENTS: comment,
        OPPORTUNITY: 0,
        UF_CRM_1697462646338: id_lead,
      },
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, data, {
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      return response.data;
    } catch (error) {
      throw new HttpException(`Failed to create deal: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  async getDealsOnProviders(idProvider?: number): Promise<BitrixReturnInfoData[]> {
    // Ростелеком idBitrixProvider - 52
    const url = `${this.bitrixHook}/${this.methodGetDeals}`;
    const params: Record<string, any> = {
      'filter[STAGE_ID]': 'PREPAYMENT_INVOICE',
      'select[]': ['*', 'UF_*'],
    };

    // Добавляем фильтр только если idProvider указан
    if (idProvider) {
      params['filter[UF_CRM_1697294773665]'] = idProvider;
    }

    const fullUrl = `${url}?${querystring.stringify(params)}`;

    try {
      const response = await firstValueFrom(
        this.httpService.get(fullUrl, {
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      if (!response.data || !response.data.result) {
        throw new HttpException('No deals found for the given provider ID', HttpStatus.NOT_FOUND);
      }
      const resultResponse = response.data.result;
      if (!resultResponse) {
        throw new HttpException('Заявок нет', HttpStatus.NOT_FOUND);
      }
      const result = [];
      for (let i = 0; i < resultResponse.length; i++) {
        result.push({
          fio: resultResponse[i].UF_CRM_1697357613372,
          number: resultResponse[i].UF_CRM_1697365970828,
          address: resultResponse[i].UF_CRM_1697646751446.split('|')[0],
          id: resultResponse[i].ID,
          provider_id: resultResponse[i].UF_CRM_1697294773665,
        });
      }
      return result;
    } catch {
      return [];
    }
  }

  async moveToAppointed(id_deal: string, comment: string): Promise<BitrixReturnData> {
    const url = `${this.bitrixHook}/${this.dealUpdate}`;
    const params = {
      ID: id_deal,
      'fields[STAGE_ID]': 'EXECUTING',
      'fields[COMMENTS]': comment,
    };
    const fullUrl = `${url}?${querystring.stringify(params)}`;

    try {
      const response = await firstValueFrom(
        this.httpService.get(fullUrl, {
          headers: { 'Content-Type': 'application/json' },
        }),
      );
      const resultResponse = response.data.result;
      return resultResponse;
    } catch (error) {
      throw new HttpException(`Failed to fetch deals: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  async moveToInStorage(id_deal: string, comment: string): Promise<BitrixReturnData> {
    const url = `${this.bitrixHook}/${this.dealUpdate}`;
    const params = {
      ID: id_deal,
      'fields[STAGE_ID]': 4,
      'fields[COMMENTS]': comment,
    };
    const fullUrl = `${url}?${querystring.stringify(params)}`;

    try {
      const response = await firstValueFrom(
        this.httpService.get(fullUrl, {
          headers: { 'Content-Type': 'application/json' },
        }),
      );
      const resultResponse = response.data.result;
      return resultResponse;
    } catch (error) {
      throw new HttpException(`Failed to fetch deals: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  async moveToError(id_deal: string, comment: string): Promise<BitrixReturnData> {
    const url = `${this.bitrixHook}/${this.dealUpdate}`;
    const params = {
      ID: id_deal,
      'fields[STAGE_ID]': 'UC_F4OKAL',
      'fields[COMMENTS]': comment,
    };
    const fullUrl = `${url}?${querystring.stringify(params)}`;

    try {
      const response = await firstValueFrom(
        this.httpService.get(fullUrl, {
          headers: { 'Content-Type': 'application/json' },
        }),
      );
      const resultResponse = response.data.result;
      return resultResponse;
    } catch (error) {
      throw new HttpException(`Failed to fetch deals: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  async editComment(id_deal: string, comment: string): Promise<void> {
    const url = `${this.bitrixHook}/${this.dealUpdate}`;
    const params = {
      ID: id_deal,
      'fields[COMMENTS]': comment,
    };
    const fullUrl = `${url}?${querystring.stringify(params)}`;

    try {
      const response = await firstValueFrom(
        this.httpService.get(fullUrl, {
          headers: { 'Content-Type': 'application/json' },
        }),
      );
      const resultResponse = response.data.result;
      return resultResponse;
    } catch (error) {
      throw new HttpException(`Failed to fetch deals: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }
}
