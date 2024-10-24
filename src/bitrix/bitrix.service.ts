import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs'; // Импортируем firstValueFrom для обработки Observable
import { BitrixContactData } from './interfaces/BitrixContactData.interface';
import { BitrixDealData } from './interfaces/BitrixDealData.interface';
import { BitrixReturnData } from './interfaces/BitrixReturnData.interface';

@Injectable()
export class BitrixService {
  private readonly methodCreateContact = 'crm.contact.add';
  private readonly methodCreateDeal = 'crm.deal.add';
  private readonly hook: string;

  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.hook = this.configService.get<string>('BITRIX_HOOK');
  }

  async createContact(
    name: string = '',
    secondName: string = '',
    lastName: string = '',
    phone: string = '',
    address: string = '',
  ): Promise<BitrixReturnData> {
    const url = `${this.hook}/${this.methodCreateContact}`;
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
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      );

      return response.data; // Возвращаем данные из ответа
    } catch (error) {
      throw new HttpException(
        `Failed to create contact: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async createDeal(
    id_client: number,
    id_distributor: number,
    address: string,
    comment: string,
    id_lead: number,
  ): Promise<BitrixReturnData> {
    const url = `${this.hook}/${this.methodCreateDeal}`;
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
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      );

      return response.data; // Возвращаем данные из ответа
    } catch (error) {
      throw new HttpException(
        `Failed to create deal: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
