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
      throw new HttpException(`Failed to create contact: ${error.message}`, HttpStatus.BAD_REQUEST);
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
      throw new HttpException(`Failed to create deal: ${error.message}`, HttpStatus.BAD_REQUEST);
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
          comment: resultResponse[i].COMMENTS,
        });
      }
      return result;
    } catch {
      return [];
    }
  }
  /**
   * Переводит сделку в статус "Назначено" с добавлением комментария.
   *
   * @param {string} id_deal - Идентификатор сделки.
   * @param {string} comment - Комментарий для сделки.
   * @returns {Promise<BitrixReturnData>} Результат обновления сделки.
   *
   * @throws {HttpException} Выбрасывается в случае ошибки HTTP-запроса с описанием причины.
   *
   * @example
   * const result = await moveToAppointed('12345', 'Назначено ответственному');
   * console.log(result);
   */
  async moveToAppointed(id_deal: string, comment: string, id_application?: string): Promise<BitrixReturnData> {
    const url = `${this.bitrixHook}/${this.dealUpdate}`;
    const params = {
      ID: id_deal,
      'fields[STAGE_ID]': 'EXECUTING',
      ...(id_application ? { 'fields[UF_CRM_1697462646338]': id_application } : {}),
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
  /**
   * Переводит сделку в статус "На сохранении" с добавлением комментария.
   *
   * @param {string} id_deal - Идентификатор сделки.
   * @param {string} comment - Комментарий для сделки.
   * @returns {Promise<BitrixReturnData>} Результат обновления сделки.
   *
   * @throws {HttpException} Выбрасывается в случае ошибки HTTP-запроса с описанием причины.
   *
   * @example
   * const result = await moveToInStorage('12345', 'Перемещено на склад');
   * console.log(result);
   */
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
  /**
   * Переводит сделку в статус "Ошибка" с добавлением комментария.
   *
   * @param {string} id_deal - Идентификатор сделки.
   * @param {string} comment - Комментарий для сделки.
   * @returns {Promise<BitrixReturnData>} Результат обновления сделки.
   *
   * @throws {HttpException} Выбрасывается в случае ошибки HTTP-запроса с описанием причины.
   *
   * @example
   * const result = await moveToError('12345', 'Ошибка при выполнении');
   * console.log(result);
   */
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
  /**
   * Редактирует комментарий к сделке в системе Bitrix24.
   *
   * @param {string} id_deal - Уникальный идентификатор сделки.
   * @param {string} comment - Новый комментарий для обновления сделки.
   * @returns {Promise<void>} Промис без возвращаемого значения (void).
   *
   * @throws {HttpException} Выбрасывается в случае ошибки HTTP-запроса с описанием причины.
   *
   * @example
   * try {
   *   await editComment('12345', 'Обновленный комментарий');
   *   console.log('Комментарий обновлен');
   * } catch (error) {
   *   console.error(error.message);
   * }
   */
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
  // TODO пересмотреть создание, изменение заявок.
  async getIdApplication() {}
  async moveToConnected() {}
  async moveToRefusal() {}
  async moveToPotential() {}
  async moveToWorkingOff() {}
}
