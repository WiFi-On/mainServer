// nest
import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { OnModuleInit } from '@nestjs/common';
// node
import axios, { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import * as https from 'https';
import * as fs from 'fs';
import { xml2js } from 'xml-js';
import { URLSearchParams } from 'url';
// src
import { DadataService } from '../dadata/dadata.service';
import { DistrictRepository } from '../db2/repositories/districts.repository';
import { StreetRepository } from '../db2/repositories/streets.repository';
import { HouseRepository } from '../db2/repositories/houses.repository';
import { ResultThvEissdI, ReturnDataConnectionPosI } from './interfaces/thv.interface';
import tariffMrfI from './interfaces/tariffMrf.interface';
import tariffI from './interfaces/tariff.interface';
import OptionI from './interfaces/option.interface';
import tariffSimI from './interfaces/tariffSim.interface';
import { StatusesApplicationI } from './interfaces/statusesApplication.interface';

@Injectable()
export class EissdService implements OnModuleInit {
  private readonly pathKeyProduct: string;
  private readonly pathCertProduct: string;
  private readonly pathKeyDev: string;
  private readonly pathCertDev: string;
  private readonly enviroment: string;
  private readonly mrfRegions: string[];
  private readonly techIds: { [key: string]: string };
  private readonly statusIdsReason: { [key: string]: { [key: string]: string } };
  private readonly statusIds: { [key: string]: string };
  private readonly serviceIds: { [key: string]: string };
  private sessionId: string;
  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
    private readonly dadataService: DadataService,
    private readonly districtRepository: DistrictRepository,
    private readonly streetRepository: StreetRepository,
    private readonly houseRepository: HouseRepository,
    private readonly httpService: HttpService,
  ) {
    this.pathKeyProduct = this.configService.get<string>('EISSD_KEY_PRODUCT');
    this.pathCertProduct = this.configService.get<string>('EISSD_CERT_PRODUCT');
    this.pathKeyDev = this.configService.get<string>('EISSD_KEY_DEV');
    this.pathCertDev = this.configService.get<string>('EISSD_CERT_DEV');
    this.enviroment = this.configService.get<string>('ENV');
    this.mrfRegions = [
      '28',
      '79',
      '41',
      '49',
      '25',
      '14',
      '65',
      '27',
      '87',
      '26',
      '15',
      '61',
      '23',
      '09',
      '08',
      '07',
      '06',
      '05',
      '34',
      '30',
      '01',
      '89',
      '74',
      '86',
      '72',
      '66',
      '59',
      '45',
      '39',
    ];
    this.techIds = {
      'БШПД (WBA)': '10063',
      PSTN: '10044',
      PON: '10037',
      FTTx: '10036',
      xDSL: '10035',
    };
    this.statusIds = {
      '1': 'Требуется провести онлайн проверку ТхВ',
      '31': 'Требуется ручная проверка ТхВ с выездом',
      '32': 'Требуется ручная проверка ТхВ без выезда',
      '34': 'Требуется уточнение адреса',
      '35': 'Требуется связаться с клиентом и назначить дату и время инсталляции',
      '36': 'Самоинсталляция / Доставка оборудования курьером, 0/1',
      '37': 'Назначены дата и время инсталляции',
      '38': 'Требуется техническая подготовка подключения услуг (кроссировка и т.п)',
      '39': 'Требуется активировать услугу / Связаться с клиентом',
      '40': 'Перенос даты и времени инсталляции',
      '41': 'Отложенная заявка / Требуется перезвонить клиенту в определенную дату',
      '42': 'Требуется организация последней мили / КИП',
      '4': 'Требуется уточнение параметров заявки',
      '7': 'Услуга подключена',
      '12': 'Отказ',
      '13': 'Дубликат',
      '14': 'Неверная заявка',
      '15': 'Тест',
      '16': 'Другая',
      '17': 'Callback. Требуется заполнить заявку',
      '20': 'Callback. Недозвон',
      '21': 'Callback. Отказ клиента',
      '22': 'Callback. Неверная заявка',
      '23': 'Callback. Выполнена',
      '43': 'Абонент должен устранить причину',
      '44': 'Принято в работу сотрудником НПП',
    };
    this.statusIdsReason = {
      '10': { status_name: 'Выбрал другого провайдера', bitrix_status: 'Отработка заявок' },
      '11': { status_name: 'Услугу не заказывал', bitrix_status: 'Отработка заявок' },
      '12': { status_name: 'Нет связи с клиентом', bitrix_status: 'Отработка заявок' },
      '13': { status_name: 'Не устроили условия монтажа линии и/или оборудования/Запрет монтажа/отсутствует бесплатная настройка', bitrix_status: 'Отработка заявок' },
      '14': { status_name: 'Неверно проинформирован по услугам, тарифам, технологиям', bitrix_status: 'Отработка заявок' },
      '15': { status_name: 'Длительный срок подключения', bitrix_status: 'Отработка заявок' },
      '16': { status_name: 'Заявка удалена по письму/звонку КЦ/через Личный кабинет', bitrix_status: 'Отработка заявок' },
      '17': { status_name: 'Без объяснения причин', bitrix_status: 'Отработка заявок' },
      '18': { status_name: 'Нежилое помещение', bitrix_status: 'Отказ', bitrix_cause: 'Нет тхв' },
      '19': { status_name: 'Квартира съемная - собственник против', bitrix_status: 'Отработка заявок' },
      '20': { status_name: 'Параметры клиента не удовлетворяют условиям акции', bitrix_status: 'Отработка заявок' },
      '21': { status_name: 'Нет свободных портов', bitrix_status: 'Отработка заявок' },
      '22': { status_name: 'Недостаточная пропускная способность абонентской линии', bitrix_status: 'Отработка заявок' },
      '23': { status_name: 'Недостаточная пропускная способность магистрального канала', bitrix_status: 'Отработка заявок' },
      '24': { status_name: 'Ошибка линейных данных', bitrix_status: 'Отработка заявок' },
      '25': { status_name: 'Нет подключения к сетям Ростелекома/Нет последней мили внутри объекта', bitrix_status: 'Отказ', bitrix_cause: 'Нет тхв' },
      '26': { status_name: 'Плохое качество услуги при демонстрации', bitrix_status: 'Отработка заявок' },
      '27': { status_name: 'Проблема (неисправность) с оконечным оборудованием РТК', bitrix_status: 'Отработка заявок' },
      '28': { status_name: 'Отсутствие оконечного оборудования Ростелеком', bitrix_status: 'Отработка заявок' },
      '29': { status_name: 'Некорректное оформление заявки/заказа/наряда/задания', bitrix_status: 'Отработка заявок' },
      '30': { status_name: 'Невыход инсталлятора в назначенное время', bitrix_status: 'Отработка заявок' },
      '31': { status_name: 'Нет доступа к оборудованию РТК', bitrix_status: 'Отработка заявок' },
      '32': { status_name: 'Претензии по качеству работы и обслуживания инсталлятора', bitrix_status: 'Отработка заявок' },
      '33': { status_name: 'Некорректное оформление документов инсталлятором', bitrix_status: 'Отработка заявок' },
      '34': { status_name: 'По адресу клиента временно не доступен сервис РТК', bitrix_status: 'Отказ', bitrix_cause: 'Нет тхв' },
      '49': { status_name: 'Существующий абонент', bitrix_status: 'Отказ', bitrix_cause: 'Дубль' },
      '51': { status_name: 'Отказ по причине отсутствия Стартового платежа', bitrix_status: 'Клиент подключен' },
      '52': { status_name: 'Отказ от перехода в платный период', bitrix_status: 'Отработка заявок' },
      '53': { status_name: 'Услуга в промо-периоде', bitrix_status: 'Отработка заявок' },
      '55': { status_name: 'Решил остаться на своем провайдере', bitrix_status: 'Отработка заявок' },
      '56': { status_name: 'Негативные отзывы о компании/ опыт коллег, знакомых, родных', bitrix_status: 'Отработка заявок' },
      '57': { status_name: 'Не устраивает стоимость тарифного плана/оборудования', bitrix_status: 'Отработка заявок' },
      '58': { status_name: 'Длительный отъезд/командировка/болезнь. Подаст заявку позднее.', bitrix_status: 'Отработка заявок' },
      '59': { status_name: 'Не устраивает предложенная технология подключения', bitrix_status: 'Отработка заявок' },
      '60': { status_name: 'Не согласен с инсталляционным платежом/годовым контрактом', bitrix_status: 'Отработка заявок' },
      '61': { status_name: 'Дебиторская задолженность', bitrix_status: 'Отказ', bitrix_cause: 'Нет тхв' },
      '62': { status_name: 'Есть финансовая блокировка', bitrix_status: 'Отказ', bitrix_cause: 'Нет тхв' },
      '63': { status_name: 'Превышена максимальная сумма рассрочек', bitrix_status: 'Отработка заявок' },
      '64': { status_name: 'Не согласен менять ТП Социальный интернет/снимать Добровольную блокировку', bitrix_status: 'Отработка заявок' },
      '65': { status_name: 'Неверный номер телефона клиента/номер не обслуживается', bitrix_status: 'Отработка заявок' },
      '66': { status_name: 'Несовершеннолетний клиент', bitrix_status: 'Отработка заявок' },
      '67': { status_name: 'У Клиента отсутствует орг. техника (телевизор, ПК, ноутбук и т.п.)', bitrix_status: 'Отработка заявок' },
      '68': { status_name: 'В заявке указан неверный адрес/другой регион', bitrix_status: 'Отработка заявок' },
      '69': { status_name: 'Клиенту требовалась консультация (тарифы, услуги, ТхВ и т.п.)', bitrix_status: 'Отработка заявок' },
      '70': { status_name: 'Не оплачен Стартовый платеж', bitrix_status: 'Клиент подключен' },
      '71': { status_name: 'Есть Социальный интернет/Добровольная блокировка', bitrix_status: 'Отработка заявок' },
      '72': { status_name: 'По просьбе клиента, до выезда инсталлятора', bitrix_status: 'Отработка заявок' },
      '73': { status_name: 'По просьбе клиента, с выездом инсталлятора', bitrix_status: 'Отработка заявок' },
      '74': { status_name: 'По инициативе РТК на ранний срок', bitrix_status: 'Отработка заявок' },
      '75': { status_name: 'Инсталлятор не успевает, сообщил в НПП', bitrix_status: 'Отработка заявок' },
      '76': { status_name: 'Инсталлятор не пришел, в НПП не сообщил', bitrix_status: 'Отработка заявок' },
      '77': { status_name: 'Проблемы с доступом к оборудованию РТК', bitrix_status: 'Отработка заявок' },
      '78': { status_name: 'На адресе требуется установить nRFS', bitrix_status: 'Отказ', bitrix_cause: 'Нет тхв' },
      '79': { status_name: 'Проблема с нарядом', bitrix_status: 'Отработка заявок' },
      '80': { status_name: 'У клиента отсутствует оконечное оборудование/ розетка для подключения', bitrix_status: 'Отработка заявок' },
      '81': { status_name: 'Отсутствие оконечного оборудования/материалов у инсталлятора', bitrix_status: 'Отработка заявок' },
      '82': { status_name: 'Сложное подключение', bitrix_status: 'Отработка заявок' },
      '83': { status_name: 'Некорректное назначение на исполнителя', bitrix_status: 'Отработка заявок' },
      '84': { status_name: 'Неблагоприятные погодные условия', bitrix_status: 'Отработка заявок' },
      '85': { status_name: 'Отсутствие инструментов/спецтехники', bitrix_status: 'Отработка заявок' },
      '86': { status_name: 'Не дозвонились до клиента', bitrix_status: 'Отработка заявок' },
      '87': { status_name: 'Нет доступного тайм-слота', bitrix_status: 'Отработка заявок' },
      '88': { status_name: 'Дубликат заявки от канала продаж', bitrix_status: 'Отказ', bitrix_cause: 'Нет тхв' },
      '89': { status_name: 'Ошибка информационной системы', bitrix_status: 'Отработка заявок' },
      '90': { status_name: 'По просьбе канала продаж', bitrix_status: 'Отработка заявок' },
      '100': { status_name: 'Выездной WFM наряд успешно создан', bitrix_status: 'Заявка назначена' },
      '101': { status_name: 'Выездной WFM наряд успешно обновлён', bitrix_status: 'Заявка назначена' },
      '102': { status_name: 'Изменения в коммерческий заказ внесены', bitrix_status: 'Заявка назначена' },
      '103': { status_name: 'Ошибка, не удалось внести изменения в коммерческий заказ', bitrix_status: 'Отработка заявок' },
      '104': { status_name: 'Ошибка назначения наряда WFM, для указанного сотрудника не удалось подобрать подходящий участок', bitrix_status: 'Отработка заявок' },
      '105': { status_name: 'Ошибка, не удалось обновить наряд WFM', bitrix_status: 'Отработка заявок' },
      '106': { status_name: 'Заявка выполнена частично', bitrix_status: 'Заявка назначена' },
      '107': { status_name: 'Основная ошибка', bitrix_status: 'Отработка заявок' },
      '108': { status_name: 'Ошибка POC', bitrix_status: 'Отработка заявок' },
      '109': { status_name: 'Ошибка при взятии заказа в работу', bitrix_status: 'Отработка заявок' },
      '110': { status_name: 'Не найдено забронированное окно', bitrix_status: 'Заявка назначена' },
    };
    this.serviceIds = {
      '1': 'Интернет',
      '2': 'IPTV',
      '3': 'Домашний телефон',
      '4': 'Умный дом',
      '5': 'Мобильная связь',
      '18': 'Wink-ТВ-онлайн',
      '1001': 'Ростелеком Лицей',
      '1044': 'Ростелеком Юрист',
    };
  }
  /**
   * Функция запускается при инициализации модуля. Нужно для получения куки файла сессии, что бы в дальнейшем можно было использовать нужные ручки.
   * @returns {Promise<void>}
   */
  async onModuleInit(): Promise<void> {
    if (this.enviroment === 'prod') {
      this.sessionId = await this.authEissd();
    }
  }

  /**
   * Формируем полностью заявку и отправляем ее.
   * 1) Получение технической возможности и информации по адресу. Техническая возможность - можно ли подключать клиента по адресу и по какой технологии.
   * 2) Получение id организации, потому что для каждого региона своя организация.
   * 3) Получение тарифа SHPD. SHPD - Интернет. У них на сайте 2 возможности получения таких тарифов. Для mrf регионов и для обычных регионов. Без понятия по каким принципам это работает, но мне все равно пришлось проверять каждый регион в ручную.
   * this.mrfRegionList нужна для знания о мрф регионов.
   * 4) По такому же принципу мы получаем IPTV. IPTV - телевидение.
   * 5) Получение SIM. SIM - симка. Работает тоже странно. Для каждого региона, есть свой айди и если на каком то адресе не находит симку, то нужно просто добавить в объект mvnoRegions с этим айди.
   * 6) Дальше создания объекта для заявки. Тут мы указываем раннее полученные данные и отправляем.
   * 7) После получения информации о заведении, в зависимости от статуса мы распределяем по битриксу.
   *
   * Все обернуто в try-catch, потому что без понятия что можно произойти. Это непредсказуемая система без документации. Весь код написан через синяки.
   *
   * Заявка на сохранении. Обозначает что технической возможности нет, но мы ее завели.
   * Заявка назначена. Обозначает что технической возможности есть и заявка завелась.
   * Остальные варианты просто кидаются в колонку ошибка в битриксе.
   * @param {string} [address=''] - Адрес для получения технической возможности по адресу.
   * @param {string} [number=''] - Номер телефона.
   * @param {string} [fio=''] - ФИО клиента.
   * @returns {Promise<BitrixReturnData>} Данные, возвращаемые системой Bitrix24 при успешном создании контакта.
   */
  async formingApplication(number: string, name: string, surname: string, thv: ResultThvEissdI): Promise<{ err: boolean; result: string; idApplication?: string }> {
    const result = {
      err: false,
      result: '',
      idApplication: '',
    };

    try {
      const orgId = await this.getOrgId(thv.infoAddress.regionId);

      // Получение тарифов
      let shpd: any, iptv: any;
      if (this.mrfRegions.includes(thv.infoAddress.regionId)) {
        shpd = await this.getSHPDtariffMRF(
          thv.infoAddress.regionId,
          thv.infoAddress.cityId,
          thv.infoAddress.streetId,
          thv.infoAddress.houseId,
          thv.infoAddress.flat,
          thv.result.TechId,
        );
        iptv = await this.getIPTVtariffMRF(
          thv.infoAddress.regionId,
          thv.infoAddress.cityId,
          thv.infoAddress.streetId,
          thv.infoAddress.houseId,
          thv.infoAddress.flat,
          thv.result.TechId,
        );
      } else {
        shpd = await this.getSHPDtariff(thv.infoAddress.regionId, thv.infoAddress.cityId, thv.result.TechId);
        iptv = await this.getIPTVtariff(thv.infoAddress.regionId, thv.infoAddress.cityId, thv.result.TechId);
      }
      if (!shpd) {
        result.err = true;
        result.result = 'Тариф SHPD не найден';
        return result;
      }
      if (!iptv) {
        result.err = true;
        result.result = 'Тариф IPTV не найден';
        return result;
      }
      const sim = await this.getSIMtariff(thv.infoAddress.regionId, orgId, thv.infoAddress.regionFullName);
      if (!sim) {
        result.err = true;
        result.result = 'Тариф SIM не найден';
        return result;
      }

      const phone = await this.formatedPhoneNumber(number);
      const eissdApplication = await this.sendAplication(name, surname, phone, [shpd, iptv, sim], orgId, thv);

      if (Object.keys(eissdApplication).length > 2) {
        if (thv.result.thv && thv.result.Res == 'Y') {
          result.idApplication = eissdApplication.orderId;
          result.result = 'Заявка назначена';
          return result;
        } else {
          result.idApplication = eissdApplication.orderId;
          result.result = 'Заявка на сохранении';
          return result;
        }
      } else {
        result.err = true;
        result.result = eissdApplication.errorText;
        return result;
      }
    } catch (error) {
      throw Error('Ошибка в формировании заявки: ' + error.message);
    }
  }
  /**
   * Функция для получения куки для взаимодействия с ручками. Я как понял, нужно переавторизовываться раз в сутки.
   * @returns {Promise<string>} Возращает куку для взяимодействия с ручкамиа.
   */
  private async authEissd(): Promise<string> {
    const url = 'https://eissd.rt.ru/mod/auth/ajax/authentication/login';
    const formData = new URLSearchParams();
    formData.append('login', this.configService.get<string>('EISSD_LOGIN'));
    formData.append('passw', this.configService.get<string>('EISSD_PASSWORD'));
    formData.append('closeOthers', '1');

    try {
      const response: AxiosResponse = await firstValueFrom(
        this.httpService.post(url, formData.toString(), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }),
      );

      const cookies = response.headers['set-cookie'];
      const sessionId = cookies[0].split(';')[0].split('=')[1];

      return sessionId;
    } catch (error) {
      throw Error('Ошибка в авторизации в Eissd: ' + error.message);
    }
  }
  async getStatusesApplication(id: string): Promise<StatusesApplicationI[]> {
    // Подготовка запроса
    const requestBody = `
      <GetSvcClassOrderStatusAgent>
        <OrderId>${id}</OrderId>
      </GetSvcClassOrderStatusAgent>
      `;

    // Отправка запроса
    let response: string;
    try {
      response = await this.sendXMLRequest(requestBody);
    } catch (error) {
      throw new Error('Ошибка в отправке запроса: ' + error.message);
    }

    // Парсинг ответа
    let parsXml;
    try {
      parsXml = await this.parseXmlResponse(response);
    } catch (error) {
      throw new Error('Ошибка в парсинге ответа: ' + error.message);
    }

    const arrStatusesXML = parsXml.GetSvcClassOrderStatusAgent[0].taskStatusList[0].taskStatusListElement;
    const result: StatusesApplicationI[] = [];

    for (let i = 0; i < arrStatusesXML.length; i++) {
      result.push({
        serviceId: arrStatusesXML[i].SvcClassId[0]._text[0],
        serviceName: this.serviceIds[arrStatusesXML[i].SvcClassId[0]._text[0]],
        statusId: arrStatusesXML[i].SvcClassStatus[0]._text[0],
        statusName: this.statusIds[arrStatusesXML[i].SvcClassStatus[0]._text[0]],
        statusReasonId: arrStatusesXML[i].SvcClassStatusReason ? arrStatusesXML[i].SvcClassStatusReason[0]._text[0] : null,
        statusReasonName: arrStatusesXML[i].SvcClassStatusReason ? this.statusIdsReason[arrStatusesXML[i].SvcClassStatusReason[0]._text[0]].status_name : null,
        bitrixStatus: arrStatusesXML[i].SvcClassStatusReason ? this.statusIdsReason[arrStatusesXML[i].SvcClassStatusReason[0]._text[0]].bitrix_status : null,
        bitrixCause: arrStatusesXML[i].SvcClassStatusReason ? this.statusIdsReason[arrStatusesXML[i].SvcClassStatusReason[0]._text[0]].bitrix_cause : null,
      });
    }
    return result;
  }
  /**
   * Функция для получения технической возможности и информации по адресу.
   * Самая сложная и страшная функция. Потому что каждый как хочет так и дрочит с этими адресами, никто не предерживается одному формату данных.
   *
   * Ошибки которые могут возникнуть:
   * - Dadata не понимает что за адрес
   * - В Eissd нет такого адреса
   * - в dadata и базе адрес есть, но записан чуть чуть по разному.(Самая распространенная ошибка)
   * @param {string} [address=''] - Адрес который нужно проверить.
   * @returns {Promise<ResultThvEissdIing>} Возвращает данные по технической возможности и информацию о адресе.
   */
  async checkTHV(address: string): Promise<ResultThvEissdI> {
    // Получаем текущую дату
    const currentDate = new Date();
    let dateNow = currentDate.toISOString();
    dateNow = dateNow.slice(0, 19) + '+00:00';

    // Получаем данные от DaData
    const infoDadata = await this.dadataService.addressCheck(address);

    if (!infoDadata) {
      throw new Error('Ошибка в получении информации от DaData');
    }
    const infoAddressDadata = infoDadata.suggestions[0].data;
    const regionId = infoAddressDadata.region_kladr_id.slice(0, 2);

    // Получение населенного пунтка
    let idDistrict = 0;
    let districtFiasId = '';
    let districtName = '';
    let districtObject = '';

    try {
      if (infoAddressDadata.area && infoAddressDadata.city) {
        const areaId = await this.districtRepository.getDistrictIDByRegionAndName(regionId, infoAddressDadata.area, infoAddressDadata.area_type);
        const cityId = await this.districtRepository.getDistrictIDByParentIDandName(areaId, infoAddressDadata.city, infoAddressDadata.city_type);

        idDistrict = cityId;
        districtFiasId = infoAddressDadata.city_fias_id;
        districtName = infoAddressDadata.city;
        districtObject = infoAddressDadata.city_type;
      }
      if (!idDistrict && infoAddressDadata.city && infoAddressDadata.settlement) {
        const cityId = await this.districtRepository.getDistrictIDByRegionAndName(regionId, infoAddressDadata.city, infoAddressDadata.city_type);
        const settlementId = await this.districtRepository.getDistrictIDByParentIDandName(cityId, infoAddressDadata.settlement, infoAddressDadata.settlement_type);

        idDistrict = settlementId;
        districtFiasId = infoAddressDadata.settlement_fias_id;
        districtName = infoAddressDadata.settlement;
        districtObject = infoAddressDadata.settlement_type;
      }
      if (!idDistrict && infoAddressDadata.area && infoAddressDadata.settlement) {
        const areaId = await this.districtRepository.getDistrictIDByRegionAndName(regionId, infoAddressDadata.area, infoAddressDadata.area_type);
        const settlementId = await this.districtRepository.getDistrictIDByParentIDandName(areaId, infoAddressDadata.settlement, infoAddressDadata.settlement_type);

        idDistrict = settlementId;
        districtFiasId = infoAddressDadata.settlement_fias_id;
        districtName = infoAddressDadata.settlement;
        districtObject = infoAddressDadata.settlement_type;
      }
      if (!idDistrict && infoAddressDadata.city) {
        const cityId = await this.districtRepository.getDistrictIDByRegionAndName(regionId, infoAddressDadata.city, infoAddressDadata.city_type);

        idDistrict = cityId;
        districtFiasId = infoAddressDadata.city_fias_id;
        districtName = infoAddressDadata.city;
        districtObject = infoAddressDadata.city_type;
      }
      if (!idDistrict && infoAddressDadata.settlement) {
        const settlementId = await this.districtRepository.getDistrictIDByRegionAndName(regionId, infoAddressDadata.settlement, infoAddressDadata.settlement_type);

        idDistrict = settlementId;
        districtFiasId = infoAddressDadata.settlement_fias_id;
        districtName = infoAddressDadata.settlement;
        districtObject = infoAddressDadata.settlement_type;
      }
    } catch (error) {
      throw new Error('Ошибка в получении id населенного пункта: ' + error.message);
    }
    if (!idDistrict) {
      throw new Error('id населенного пункта не найдет в базе');
    }

    // Получение айди улицы
    let idStreet = 0;
    let streetName = '';
    let streetObject = '';

    try {
      idStreet = await this.streetRepository.GetStreetIDByNameAndDistrictId(infoAddressDadata.street, idDistrict);
      streetName = infoAddressDadata.street;
      streetObject = infoAddressDadata.street_type;
    } catch (error) {
      throw new Error('Ошибка в получении id улицы: ' + error.message);
    }
    if (!idStreet) {
      throw new Error('id улицы не найден в базе');
    }

    // Получение айди дома
    let idHouse: number;
    let houseAndBlock = '';

    try {
      houseAndBlock = infoAddressDadata.house + (infoAddressDadata.block ? ` ${infoAddressDadata.block}` : '');
      idHouse = await this.houseRepository.GetStreetIDByNameAndDistrictId(houseAndBlock, idStreet);
    } catch (error) {
      throw new Error('Ошибка в получении id дома: ' + error.message);
    }
    if (!idHouse) {
      throw new Error('id дома не найден в базе');
    }

    // Подготовка запроса
    const requestBody = `
        <CheckConnectionPossibilityAgent DateRequest="${dateNow}" IdRequest="10001">
          <Release>2</Release>
          <RegionId>${regionId}</RegionId>
          <CityId>${idDistrict}</CityId>
          <StreetId>${idStreet}</StreetId>
          <HouseId>${idHouse}</HouseId>
          <Flat>${infoAddressDadata.flat ? infoAddressDadata.flat : 0}</Flat>
          <TypeAdrId>0</TypeAdrId>
          <SvcClassIds>
            <SvcClassId>2</SvcClassId>
          </SvcClassIds>
        </CheckConnectionPossibilityAgent>
      `;

    // Отправка запроса
    let response: string;
    try {
      response = await this.sendXMLRequest(requestBody);
    } catch (error) {
      throw new Error('Ошибка в отправке запроса: ' + error.message);
    }

    // Парсинг ответа
    let parsXml;
    try {
      parsXml = await this.parseXmlResponse(response);
    } catch (error) {
      throw new Error('Ошибка в парсинге ответа: ' + error.message);
    }

    // Поиск технической возможности
    let formattedResult: ReturnDataConnectionPosI;
    try {
      const validTechNames = ['PON', 'FTTx', 'xDSL', 'WBA', 'DOCSIS'];
      const result = parsXml.CheckConnectionPossibilityAgent[0].ConnectionPoss[0].ConnectionPos.find((pos) => {
        return validTechNames.includes(pos.TechName[0]._text[0]) && ['Y', 'U'].includes(pos.Res[0]._text[0]);
      });
      formattedResult = result
        ? {
            TechName: result.TechName[0]._text[0],
            Res: result.Res[0]._text[0],
            TechId: this.techIds[result.TechName[0]._text[0]],
            thv: true,
          }
        : { TechName: 'xDSL', Res: 'Y', TechId: '10035', thv: false };
    } catch (error) {
      throw new Error('Ошибка в проверке результата запроса на техническую возможность: ' + error.message);
    }

    return {
      result: formattedResult,
      districtFiasId: districtFiasId,
      infoAddress: {
        regionId: regionId,
        cityId: idDistrict.toString(),
        streetId: idStreet.toString(),
        houseId: idHouse.toString(),
        flat: infoAddressDadata.flat,
        districtName: districtName,
        districtObject: districtObject,
        streetName: streetName,
        streetObject: streetObject,
        house: houseAndBlock,
        regionFullName: infoAddressDadata.region + ' ' + infoAddressDadata.region_type_full,
      },
    };
  }
  /**
   * Функция для получения айди организации. Потому что для каждого региона своя организация.
   *
   * @param {string} [regionId=''] - регион. Пример - 01, 72, 50.
   * @returns {Promise<string>} Возвращает айди организации.
   */
  private async getOrgId(regionId: string): Promise<string> {
    const endpoint = 'https://eissd.rt.ru/ajax/orgs/get.default.org.by.region';

    try {
      // Данные запроса
      const requestData = new URLSearchParams({
        regionId,
      });

      // Отправка POST-запроса
      const response = await axios.post(endpoint, requestData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          Cookie: `SESSION_ID=${this.sessionId}`, // Передаём SESSION_ID в Cookie
        },
      });

      if (response.data?.errorCode == 401 || response.data?.errorCode == 400) {
        this.sessionId = await this.authEissd();
        return null;
      }

      return response.data.result.id; // Возвращаем данные ответа
    } catch (error) {
      throw new Error('Ошибка в получении id организации: ' + error.message);
    }
  }
  // Получение мрф тарифов
  /**
   * Функция для получения SHPD тарифа для mrf регионов.
   *
   * @param {string} [regionId=''] - регион. Пример - 01, 72, 50.
   * @param {string} [cityId=''] - локальный айди населенного пункта.
   * @param {string} [streetId=''] - локальный айди улицы.
   * @param {string} [houseId=''] - локальный айди дома.
   * @param {string} [flat=''] - квартира.
   * @param {string} [techId=''] - айди технологии подключения.
   * @returns {Promise<tariffMrfI>} Возвращает айди организации.
   */
  private async getSHPDtariffMRF(regionId: string, cityId: string, streetId: string, houseId: string, flat: string, techId: string): Promise<tariffMrfI> {
    const endpoint = 'https://eissd.rt.ru/mpz/ajax/get_mrf_tariffs_list';

    try {
      // Данные запроса
      const requestData = new URLSearchParams({
        region: regionId,
        cityId: cityId,
        streetId: streetId,
        houseId: houseId,
        flat: flat,
        isNew: 'false',
        channelId: '68',
        technology: techId,
        svcClassIds: '1',
      });

      // Отправка POST-запроса
      const response = await axios.post(endpoint, requestData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          Cookie: `SESSION_ID=${this.sessionId}`,
        },
      });

      if (response.data?.errorCode == 401 || response.data?.errorCode == 400) {
        this.sessionId = await this.authEissd();
        return null;
      }

      const result = {
        productTypeRequest: 0,
        serviceId: 10000,
        techId: techId,
        typeProduct: 1,
        typeTariff: 3,
        params: [
          {
            paramKey: 'elk_request',
            paramValue: '1',
          },
        ],
        productRegion: regionId,
        productAsrTariffId: response.data.result[0].asrTariffId,
        productTariffName: response.data.result[0].title,
      };

      return result; // Возвращаем данные ответа
    } catch (error) {
      throw new Error('Ошибка в получении SHPD MRF тарифа: ' + error.message);
    }
  }
  /**
   * Функция для получения IPTV тарифа для mrf регионов.
   *
   * @param {string} [regionId=''] - регион. Пример - 01, 72, 50.
   * @param {string} [cityId=''] - локальный айди населенного пункта.
   * @param {string} [streetId=''] - локальный айди улицы.
   * @param {string} [houseId=''] - локальный айди дома.
   * @param {string} [flat=''] - квартира.
   * @param {string} [techId=''] - айди технологии подключения.
   * @returns {Promise<tariffMrfI>} Возвращает
   */
  private async getIPTVtariffMRF(regionId: string, cityId: string, streetId: string, houseId: string, flat: string, techId: string): Promise<tariffMrfI> {
    const endpoint = 'https://eissd.rt.ru/mpz/ajax/get_mrf_tariffs_list';

    try {
      // Данные запроса
      const requestData = new URLSearchParams({
        region: regionId,
        cityId: cityId,
        streetId: streetId,
        houseId: houseId,
        flat: flat,
        isNew: 'false',
        channelId: '68',
        technology: techId,
        svcClassIds: '2',
      });

      // Отправка POST-запроса
      const response = await axios.post(endpoint, requestData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          Cookie: `SESSION_ID=${this.sessionId}`, // Передаём SESSION_ID в Cookie
        },
      });

      if (response.data?.errorCode == 401 || response.data?.errorCode == 400) {
        this.sessionId = await this.authEissd();
        return null;
      }

      const result = {
        productTypeRequest: 0,
        serviceId: 10004,
        techId: techId,
        typeProduct: 1,
        typeTariff: 3,
        params: [
          {
            paramKey: 'elk_request',
            paramValue: '1',
          },
        ],
        productRegion: regionId,
        productAsrTariffId: response.data.result[0].asrTariffId,
        productTariffName: response.data.result[0].title,
      };

      return result; // Возвращаем данные ответа
    } catch (error) {
      throw new Error('Ошибка в получении IPTV MRF тарифа: ' + error.message);
    }
  }
  // Получение тарифов
  /**
   * Функция для получения SHPD тарифа.
   *
   * @param {string} [regionId=''] - регион. Пример - 01, 72, 50.
   * @param {string} [districtId=''] - локальный айди населенного пункта.
   * @param {string} [techId=''] - айди технологии подключения.
   * @returns {Promise<tariffI>} Возвращает айди организации.
   */
  private async getSHPDtariff(regionId: string, districtId: string, techId: string): Promise<tariffI> {
    const endpoint = 'https://eissd.rt.ru/ajax/internet/get.tariff.list';

    try {
      // Данные запроса
      const requestData = new URLSearchParams({
        region: regionId,
        channel: '68',
        isActual: '1',
        cityId: districtId,
        changeTariff: 'false',
        serviceId: '10000',
      });

      // Отправка POST-запроса
      const response = await axios.post(endpoint, requestData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          Cookie: `SESSION_ID=${this.sessionId}`,
        },
      });

      if (response.data?.errorCode == 401 || response.data?.errorCode == 400) {
        this.sessionId = await this.authEissd();
        return null;
      }

      const resultTariff = response.data.result.find((tariff: any) => !tariff.isPack && tariff.name.includes('Технологический'));
      const optionTariff = await this.getSHPDoptionsTariff(regionId, resultTariff.versionId, techId);
      const result = {
        productTarId: resultTariff.versionId,
        productTypeRequest: 0,
        serviceId: 10000,
        techId: techId,
        typeProduct: 1,
        typeTariff: 1,
        id: resultTariff.versionId,
        options: optionTariff ? [optionTariff] : [],
      };

      return result; // Возвращаем данные ответа
    } catch (error) {
      throw new Error('Ошибка в получении SHPD тарифа: ' + error.message);
    }
  }
  /**
   * Функция для получения IPTV тарифа.
   *
   * @param {string} [regionId=''] - регион. Пример - 01, 72, 50.
   * @param {string} [districtId=''] - локальный айди населенного пункта.
   * @param {string} [techId=''] - айди технологии подключения.
   * @returns {Promise<tariffI>} Возвращает айди организации.
   */
  private async getIPTVtariff(regionId: string, districtId: string, techId: string): Promise<tariffI> {
    const endpoint = 'https://eissd.rt.ru/ajax/iptv/get.tariff.list';

    try {
      // Данные запроса
      const requestData = new URLSearchParams({
        region: regionId,
        channel: '68',
        isActual: '1',
        cityId: districtId,
        changeTariff: 'false',
        serviceId: '10004',
      });

      // Отправка POST-запроса
      const response = await axios.post(endpoint, requestData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          Cookie: `SESSION_ID=${this.sessionId}`, // Передаём SESSION_ID в Cookie
        },
      });

      if (response.data?.errorCode == 401 || response.data?.errorCode == 400) {
        this.sessionId = await this.authEissd();
        return null;
      }

      const resultTariff = response.data.result.find((tariff: any) => !tariff.isPack && tariff.name.includes('Технологический'));
      const optionTariff = await this.getIPTVoptionsTariff(regionId, resultTariff.versionId);
      const result = {
        productTarId: resultTariff.versionId,
        productTypeRequest: 0,
        serviceId: 10004,
        techId: techId,
        typeProduct: 1,
        typeTariff: 1,
        id: resultTariff.versionId,
        options: optionTariff ? [optionTariff] : [],
      };

      return result; // Возвращаем данные ответа
    } catch (error) {
      throw new Error('Ошибка в получении IPTV тарифа: ' + error.message);
    }
  }
  // Получение опций для тарифа
  /**
   * Функция для получения опции для shpd тарифа. Есть тарифы, в которых обязательно должна быть опция. Допустим есть тариф: Технологический, но он включает в себя по умолчанию интернет.
   *
   * @param {string} [regionId=''] - регион. Пример - 01, 72, 50.
   * @param {string} [tariffId=''] - айди тарифа.
   * @param {string} [techId=''] - айди технологии подключения.
   * @returns {Promise<OptionI>} Возвращает объект опции для тарифа.
   */
  private async getSHPDoptionsTariff(regionId: string, tariffId: string, techId: string): Promise<OptionI> {
    const endpoint = 'https://eissd.rt.ru/mpz/ajax/internet/tariff_options';

    try {
      // Данные запроса
      const requestData = new URLSearchParams({
        tariffVersion: tariffId,
        channelId: '68',
        region: regionId,
      });

      // Отправка POST-запроса
      const response = await axios.post(endpoint, requestData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          Cookie: `SESSION_ID=${this.sessionId}`, // Передаём SESSION_ID в Cookie
        },
      });

      if (response.data?.errorCode == 401 || response.data?.errorCode == 400) {
        this.sessionId = await this.authEissd();
        return null;
      }

      const result = {
        optionCost: 0,
        optionCount: 1,
        optionFee: 0,
        optionName: '',
      };
      const foundOption = Object.keys(response.data.result.options).find((key) => response.data.result.options[key].required);
      if (foundOption) {
        const option = response.data.result.options[foundOption];
        result.optionName = option.label;
        result.optionCost = option.pays[techId].cost;
        result.optionFee = option.pays[techId].fee;

        return result;
      }

      return null;
    } catch (error) {
      throw new Error('Ошибка в получении SHPD опции тарифа: ' + error.message);
    }
  }
  /**
   * Функция для получения опции для iptv тарифа. Есть тарифы, в которых обязательно должна быть опция. Допустим есть тариф: Технологический, но он включает в себя по умолчанию интернет.
   *
   * @param {string} [regionId=''] - регион. Пример - 01, 72, 50.
   * @param {string} [tariffId=''] - айди тарифа.
   * @returns {Promise<OptionI>} Возвращает объект опции для тарифа.
   */
  private async getIPTVoptionsTariff(regionId: string, tariffId: string): Promise<OptionI> {
    const endpoint = 'https://eissd.rt.ru/mpz/ajax/iptv/tariff_options';

    try {
      // Данные запроса
      const requestData = new URLSearchParams({
        tariffVersion: tariffId,
        channelId: '68',
        region: regionId,
      });

      // Отправка POST-запроса
      const response = await axios.post(endpoint, requestData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          Cookie: `SESSION_ID=${this.sessionId}`, // Передаём SESSION_ID в Cookie
        },
      });

      if (response.data?.errorCode == 401 || response.data?.errorCode == 400) {
        this.sessionId = await this.authEissd();
        return null;
      }

      const result = {
        optionCost: 0,
        optionCount: 1,
        optionFee: 0,
        optionName: '',
      };
      const foundOption = response.data.result.packets.find((option: any) => option.required);
      if (foundOption) {
        result.optionName = foundOption.id;
        result.optionCost = foundOption.cost;
        result.optionFee = foundOption.fee;
        return result;
      } else {
        result.optionName = response.data.result.packets[0].id;
        result.optionCost = response.data.result.packets[0].cost;
        result.optionFee = response.data.result.packets[0].fee;
        return result;
      }

      return null;
    } catch (error) {
      throw new Error('Ошибка в получении IPTV опции тарифа: ' + error.message);
    }
  }
  // Получение симки
  /**
   * Функция для получения симки. Здесь есть проблема. Иногда тариф не находит, потому что не подходит айди mvno региона или его вообще нет.
   * В таких случаях нужно заходить в eissd и дополнять объект mvnoRegions.
   *
   * @param {string} [region=''] - регион. Пример - 01, 72, 50.
   * @param {string} [orgId=''] - айди орагинизации.
   * @param {string} [regionFullName=''] - полное название региона.
   * @returns {Promise<tariffSimI>} Возвращает объект опции для тарифа.
   */
  private async getSIMtariff(region: string, orgId: string, regionFullName: string): Promise<tariffSimI> {
    const endpoint = 'https://eissd.rt.ru/ajax/mvno/get.tp.list';
    const mvnoRegions = {
      '66': 1,
      '45': 2,
      '59': 3,
      '89': 4,
      '72': 5,
      '86': 6,
      '74': 7,
      '01': 43,
      '22': 10,
      '29': 12,
      '31': 15,
      '32': 16,
      '03': 17,
      '33': 18,
      '34': 19,
      '35': 20,
      '36': 21,
      '79': 23,
      '38': 28,
      '39': 31,
      '40': 33,
      '41': 34,
      '10': 36,
      '42': 37,
      '43': 38,
      '11': 39,
      '44': 42,
      '23': 43,
      '24': 44,
      '97': 44,
      '46': 45,
      '47': 46,
      '48': 47,
      '49': 48,
      '12': 49,
      '13': 50,
      '77': 51,
      '50': 51,
      '51': 53,
      '83': 96,
      '52': 55,
      '53': 56,
      '54': 57,
      '55': 58,
      '56': 59,
      '57': 60,
      '58': 61,
      '25': 62,
      '60': 63,
      '61': 64,
      '62': 65,
      '63': 66,
      '78': 46,
      '64': 68,
      '65': 70,
      '67': 72,
      '68': 75,
      '16': 76,
      '69': 77,
      '70': 78,
      '71': 79,
      '17': 80,
      '18': 81,
      '73': 82,
      '19': 80,
      '21': 86,
      '26': 73,
      '28': 11,
      '15': 71,
      '09': 35,
      '14': 69,
      '02': 14,
    };

    try {
      // Данные запроса
      const requestData = new URLSearchParams({
        orgId: orgId,
        isPhys: 'true',
        mvnoRegion: mvnoRegions[region],
      });
      // Отправка POST-запроса
      const response = await axios.post(endpoint, requestData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          Cookie: `SESSION_ID=${this.sessionId}`, // Передаём SESSION_ID в Cookie
        },
      });

      if (response.data?.errorCode == 401 || response.data?.errorCode == 400) {
        this.sessionId = await this.authEissd();
        return null;
      }

      const resultResponse = response.data.result;

      const result: tariffSimI = {
        serviceId: 10003,
        typeProduct: 1,
        typeTariff: 0,
        mobileInfo: [
          {
            regionId: mvnoRegions[region],
            offerId: resultResponse[resultResponse.length - 1].id,
            regionName: regionFullName,
            offerName: resultResponse[resultResponse.length - 1].tarName,
            price: 0,
            count: 1,
            fee: null,
          },
        ],
      };

      return result;
    } catch (error) {
      throw new Error('Ошибка в получении симки: ' + error.message);
    }
  }
  // Создание и отправка заявки
  /**
   * Функция для отправки запроса на создание заявки. Внутри уже указан обязательный комментарий.
   *
   * @param {string} [name=''] - Имя клиента.
   * @param {string} [lastname=''] - Фамилия клиента.
   * @param {string} [phone=''] - Номер телефона клиента. Без знаков, пробелов, без +7 или 8, начинается обязательно с 9 Пример: 9998887766
   * @param {string} [tariffs=''] - Список тарифов. Обязательно везде должны быть 3 типа тарифа.
   * @param {string} [orgId=''] - Айди региона.
   * @param {string} [eissdInfo=''] - Объект из функции для получения тхв, что бы брать от туда нужную инфу.
   * @returns {Promise<any>} Потому что там приходит огромнейший объект и иногда разный.
   */
  private async sendAplication(name: string, lastname: string, phone: string, tariffs: any[], orgId: string, eissdInfo: ResultThvEissdI): Promise<any> {
    const endpoint = 'https://eissd.rt.ru/sales/api/ajax/save-order';

    try {
      // Данные запроса
      const requestData = {
        automaticProcessing: null,
        idCRM: '',
        contactId: '',
        isSaveTechPoss: false,
        contactFirstName: name,
        contactLastName: lastname,
        contactMiddleName: '',
        contactEmail: '',
        contactPhone: phone,
        contactPhoneHome: '',
        activeSellerId: null,
        channelId: '68',
        dogId: null,
        dogNumber: '',
        id: null,
        notifyEmail: 0,
        notifySms: 1,
        orgId: orgId,
        personnalAccount: '',
        regionId: eissdInfo.infoAddress.regionId,
        requestContent: 'Техно выгоды. Интернет + ТВ + СВЯЗЬ Продавец: ИП Кривошеин ЯП',
        params: [
          {
            key: 'request_content',
            value: 'Техно выгоды. Интернет + ТВ + СВЯЗЬ Продавец: ИП Кривошеин ЯП',
          },
        ],
        requestNumber: '',
        workerId: '',
        wishDateCall: '',
        wishTimeCallBegin: null,
        wishTimeCallEnd: null,
        insAddressPhone: '',
        requestVersId: null,
        cityId: eissdInfo.infoAddress.cityId,
        city: eissdInfo.infoAddress.districtObject + ' ' + eissdInfo.infoAddress.districtName,
        streetId: eissdInfo.infoAddress.streetId,
        street: eissdInfo.infoAddress.streetObject + ' ' + eissdInfo.infoAddress.streetName,
        house: eissdInfo.infoAddress.house,
        houseId: eissdInfo.infoAddress.houseId,
        flat: eissdInfo.infoAddress.flat,
        contractNumber: null,
        contractDate: null,
        isNewPersAccount: false,
        nwPackageOfferMsisdn: null,
        nwPackageOfferId: null,
        clientLastName: lastname,
        clientFirstName: name,
        clientMiddleName: '',
        documentExtraInfo: '',
        documentNumber: '',
        documentDate: '',
        documentSeries: '',
        documentType: '39',
        birthPlace: '',
        birthDay: '',
        systemCreateId: '',
        factEquipment: [],
        poc: null,
        isFlex: false,
        techTariffsForFlex: '[]',
        isWebComponent: false,
        orderPersInfo: null,
        uuid: null,
        potentialDemand: null,
        passageControlProcedure: 11697,
        maximumInstallmentAmount: null,
        allowedInstallmentAmount: null,
        controlIndicatorAccounts: null,
        orderReworkStatus: 0,
        skipCheckPersonalInfo: false,
        infSources: [],
        devices: [],
        products: tariffs,
        checkTechPossAddresses: [],
        existingServices: [],
        wishTimeStart: '',
        wishTimeEnd: '',
        agreedDateTimeBegin: '',
        agreedDateTimeEnd: '',
        isOrderCreation: false,
        isVerify: false,
        mrfTotalCost: '',
        mrfTotalFee: '',
      };

      // Отправка POST-запроса
      const response = await axios.post(endpoint, requestData, {
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          Cookie: `SESSION_ID=${this.sessionId}`, // Передаём SESSION_ID в Cookie
        },
      });

      return response.data; // Возвращаем данные ответа
    } catch (error) {
      throw new Error('Ошибка при заведении заявки в eissd: ' + error.message);
    }
  }
  // Побочные функции
  /**
   * Функция для SOAP-запроса. Внутри уже сразу указаны сертификаты и ключи.
   *
   * @param {string} [body=''] - XML данные.
   * @returns {Promise<string>} Возвращает данные.
   */
  private async sendXMLRequest(body: string): Promise<string> {
    try {
      // Загрузка сертификата и ключа
      const cert = fs.readFileSync(this.pathCertProduct);
      const key = fs.readFileSync(this.pathKeyProduct);

      const options: https.RequestOptions = {
        hostname: 'mpz.rt.ru', // Ваш хост
        port: 443,
        path: '/xmlInteface', // Путь к API
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml',
        },
        key: key,
        cert: cert,
        rejectUnauthorized: false, // Отключение проверки сертификатов, если это необходимо
      };

      return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
          let data = '';

          // Чтение данных из ответа
          res.on('data', (chunk) => {
            data += chunk;
          });

          // Завершаем и возвращаем данные
          res.on('end', () => {
            resolve(data);
          });
        });

        // Обработка ошибок
        req.on('error', (error) => {
          console.error('Error during request:', error);
          reject(error);
        });

        // Отправка тела запроса
        req.write(body);

        // Завершаем запрос
        req.end();
      });
    } catch (error) {
      throw new Error('Ошибка при отправке xml запроса: ' + error.message);
    }
  }
  /**
   * Функция для парсинга XML-ответа.
   *
   * @param {string} [xmlData=''] - XML данные.
   * @returns {Promise<string>} Возвращает парсенные данные.
   */
  private async parseXmlResponse(xmlData: string): Promise<any> {
    try {
      const options = {
        compact: true,
        ignoreComment: true,
        alwaysArray: true,
      };

      // Парсим XML и ждем результат
      const result = xml2js(xmlData, options);

      return result;
    } catch (error) {
      throw new Error('Ошибка при парсинге xml ответа: ' + error.message);
    }
  }
  /**
   * Функция для разбора номера. Информация о клиенте подтягивается из битрикса, а номер там могут написать от души.
   *
   * @param {string} [input=''] - Кривой номер телефона.
   * @returns {Promise<string>} - Возвращает корректный номер.
   */
  private async formatedPhoneNumber(input: string): Promise<string | null> {
    try {
      // Удаляем все пробелы, знаки `+`, `-`, `(`, `)` из номера
      const cleaned = input.replace(/[+\-\s()]/g, '');

      // Если номер начинается с 7 или 8 и имеет длину 11
      if ((cleaned.startsWith('7') || cleaned.startsWith('8')) && cleaned.length === 11) {
        return cleaned.slice(1); // Убираем первую цифру
      }

      // Если номер уже состоит из 10 цифр
      if (cleaned.length === 10) {
        return cleaned;
      }

      // Если номер не подходит по формату
      return null;
    } catch (error) {
      throw new Error('Ошибка при валидации номера: ' + error.message);
    }
  }
  async formatedFIO(input: string): Promise<{ name: string; surname: string }> {
    try {
      const result = {
        name: 'Александр',
        surname: '-',
      };

      const arrFio = input.split(' ');
      if (arrFio.length > 1) {
        result.surname = arrFio[0];
        result.name = arrFio[1];
      } else {
        result.name = arrFio[0];
      }

      return result;
    } catch (error) {
      throw new Error('Ошибка при валидации ФИО: ' + error.message);
    }
  }
}
