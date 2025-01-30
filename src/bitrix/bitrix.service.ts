import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs'; // Для обработки Observable
import * as querystring from 'querystring'; // Для кодирования параметров URL
import { BitrixContactData } from './interfaces/BitrixContactData.interface';
import { BitrixDealData } from './interfaces/BitrixDealData.interface';
import { BitrixReturnData } from './interfaces/BitrixReturnData.interface';
import { BitrixReturnInfoData } from './interfaces/BitrixReturnInfoData.interface';
import { BitrixStatuses } from './interfaces/BitrixStatuses.interface';
import axios from 'axios';

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

  /**
   * Создает новый контакт в системе Bitrix24.
   *
   * @param {string} [name=''] - Имя контакта.
   * @param {string} [secondName=''] - Отчество контакта.
   * @param {string} [lastName=''] - Фамилия контакта.
   * @param {string} [phone=''] - Номер телефона контакта.
   * @param {string} [address=''] - Адрес контакта.
   * @returns {Promise<BitrixReturnData>} Данные, возвращаемые системой Bitrix24 при успешном создании контакта.
   *
   * @throws {HttpException} Выбрасывается в случае ошибки HTTP-запроса с описанием причины.
   *
   * @example
   * const contact = await createContact('Иван', 'Иванович', 'Петров', '+79998887766', 'Москва');
   * console.log(contact);
   */
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
      throw new Error('Ошибка в создании контакта в битрикс: ' + error.message);
    }
  }
  /**
   * Создает новую сделку в системе Bitrix24.
   *
   * @param {number} id_client - Идентификатор клиента.
   * @param {number} id_distributor - Идентификатор дистрибьютора.
   * @param {string} address - Адрес сделки.
   * @param {string} comment - Комментарий к сделке.
   * @param {number} id_lead - Идентификатор лида.
   * @returns {Promise<BitrixReturnData>} Данные, возвращаемые системой Bitrix24 при успешном создании сделки.
   *
   * @throws {HttpException} Выбрасывается в случае ошибки HTTP-запроса с описанием причины.
   *
   * @example
   * const deal = await createDeal(123, 456, 'Москва, ул. Ленина', 'Новый заказ', 789);
   * console.log(deal);
   */
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
      throw new Error('Ошибка в создании сделки в битрикс: ' + error.message);
    }
  }
  /**
   * Получает список сделок от указанного провайдера или всех провайдеров.
   *
   * @param {number} [idProvider] - Идентификатор провайдера (опционально). Если не указан, возвращаются сделки всех провайдеров.
   * @returns {Promise<BitrixReturnInfoData[]>} Список сделок, включая информацию о клиенте, номере, адресе, провайдере и идентификаторе.
   *
   * @throws {HttpException} Если не удается получить данные или сделки не найдены.
   *
   * @example
   * const deals = await getDealsOnProviders(52);
   * console.log(deals);
   */
  async getDeals(status: BitrixStatuses, idProvider?: number): Promise<BitrixReturnInfoData[]> {
    // Ростелеком idBitrixProvider - 52
    const url = `${this.bitrixHook}/${this.methodGetDeals}`;
    const params: Record<string, any> = {
      'filter[STAGE_ID]': status,
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
      const resultResponse = response.data.result;

      const result: BitrixReturnInfoData[] = [];
      for (let i = 0; i < resultResponse.length; i++) {
        result.push({
          fio: resultResponse[i].UF_CRM_1697357613372,
          number: resultResponse[i].UF_CRM_1697365970828,
          address: resultResponse[i].UF_CRM_1697646751446.split('|')[0],
          id: resultResponse[i].ID,
          provider_id: resultResponse[i].UF_CRM_1697294773665,
          comment: resultResponse[i].COMMENTS,
          application_id: resultResponse[i].UF_CRM_1697462646338,
        });
      }
      return result;
    } catch (error) {
      throw new Error('Ошибка в получении заявок из битрикса: ' + error.message);
    }
  }
  async editApplication(id_deal: string, comment?: string, id_application?: string, status?: BitrixStatuses): Promise<void> {
    const url = `${this.bitrixHook}/${this.dealUpdate}`;

    // Формируем параметры запроса
    const params: Record<string, string | number> = {
      ID: id_deal,
    };

    if (status) {
      params['fields[STAGE_ID]'] = status;
    }
    if (id_application) {
      params['fields[UF_CRM_1697462646338]'] = id_application;
    }
    if (comment) {
      params['fields[COMMENTS]'] = comment;
    }

    try {
      // Отправляем GET-запрос через axios
      const response = await axios.get(url, {
        headers: { 'Content-Type': 'application/json' },
        params,
      });

      // Получаем данные из ответа
      const resultResponse = response.data.result;
      return resultResponse;
    } catch (error) {
      throw new Error(`Ошибка при обновлении сделки в битрикс: ${error.message}`);
    }
  }
}
