// nest
import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
// import { Cron } from '@nestjs/schedule';
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
import { ResultThvEissdI } from '../eissd/interfaces';
import { BitrixService } from '../bitrix/bitrix.service';

@Injectable()
export class EissdService {
  private readonly logger = new Logger(EissdService.name);
  private readonly pathKeyProduct: string;
  private readonly pathCertProduct: string;
  private readonly pathKeyDev: string;
  private readonly pathCertDev: string;
  private readonly mrfRegionList: string[];
  private sessionId: string;
  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
    private readonly dadataService: DadataService,
    private readonly districtRepository: DistrictRepository,
    private readonly streetRepository: StreetRepository,
    private readonly houseRepository: HouseRepository,
    private readonly httpService: HttpService,
    private readonly bitrixService: BitrixService,
  ) {
    this.pathKeyProduct = this.configService.get<string>('EISSD_KEY_PRODUCT');
    this.pathCertProduct = this.configService.get<string>('EISSD_CERT_PRODUCT');
    this.pathKeyDev = this.configService.get<string>('EISSD_KEY_DEV');
    this.pathCertDev = this.configService.get<string>('EISSD_CERT_DEV');
    this.mrfRegionList = [
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
  }

  // async onModuleInit() {
  //   this.sessionId = await this.authEissd();
  //   await this.main();
  // }

  async main(): Promise<void> {
    // const testData = [
    //   // {
    //   //   address: 'обл. Тюменская, рп Боровский, ул. Мира, 25',
    //   //   fio: 'Тест Тест Тест',
    //   //   number: '9111111111',
    //   // },
    //   // {
    //   //   address: 'край Алтайский, п. Верх‑Обский, ул. Пожарная, 18',
    //   //   fio: 'Тест Тест Тест',
    //   //   number: '9111111111',
    //   // },
    //   // {
    //   //   address: 'Калининград г Улица: Каштановая аллея ул Дом: д. 166 Квартира: 13 кв.',
    //   //   fio: 'Тест Тест Тест',
    //   //   number: '9111111111',
    //   // },
    //   // {
    //   //   address: 'край Пермский, д. Гамы, ул. Советская, 89, ',
    //   //   fio: 'Тест Тест Тест',
    //   //   number: '9111111111',
    //   // },
    //   // {
    //   //   address: 'г. Екатеринбург, ул. Рябинина, 47 кв 600',
    //   //   fio: 'Тест Тест Тест',
    //   //   number: '9111111111',
    //   // },
    //   // {
    //   //   address: 'г. Краснодар, пер. Угольный, 6, кв 17',
    //   //   fio: 'Тест Тест Тест',
    //   //   number: '9111111111',
    //   // },
    //   // {
    //   //   address: 'г. Калининград, ул. Красная, 261 кв 3',
    //   //   fio: 'Тест Тест Тест',
    //   //   number: '9111111111',
    //   // },
    //   // {
    //   //   address: 'г. Абакан, ул. Арбан, 4 кв 85',
    //   //   fio: 'Тест Тест Тест',
    //   //   number: '9111111111',
    //   // },
    //   {
    //     address: 'г Санкт-Петербург, ул Стародеревенская, д 19 к 1 кв 172',
    //     fio: 'Тест Тест Тест',
    //     number: '9111111111',
    //     id: '175',
    //   },
    //   // {
    //   //   address: 'г. Краснодар, ул. им Васнецова, 39',
    //   //   fio: 'Тест Тест Тест',
    //   //   number: '9111111111',
    //   //   id: '175',
    //   // },
    // ];
    const leadsBitrixRtk = await this.bitrixService.getDealsOnProviders(52);
    if (!leadsBitrixRtk.length) {
      this.logger.error(`Лидов нет || PATH: eissd/main`);
      return;
    }
    for (const lead of leadsBitrixRtk) {
      try {
        // Получение технической возможности и id организации.
        const thv = await this.checkTHV(lead.address);
        console.log(thv);
        if (!thv) {
          this.logger.error(`Техническая возможность не найдена || ADDRESS: ${lead.address} || PATH: eissd/main`);
          this.bitrixService.moveToError(lead.id);
          continue;
        }
        const orgId = await this.getOrgId(thv.infoAddress.regionId);
        if (!orgId) {
          this.logger.error(`Айди организации не найден || REGION: ${thv.infoAddress.regionId} || PATH: eissd/main`);
          this.bitrixService.moveToError(lead.id);
          continue;
        }
        // Получение тарифов
        let shpd: any, iptv: any;
        if (this.mrfRegionList.includes(thv.infoAddress.regionId)) {
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
          this.logger.error(`Тариф SHPD не найден || REGION: ${thv.infoAddress.regionId} || PATH: eissd/main`);
          this.bitrixService.moveToError(lead.id);
          continue;
        }
        if (!iptv) {
          this.logger.error(`Тариф IPTV не найден || REGION: ${thv.infoAddress.regionId} || PATH: eissd/main`);
          continue;
        }
        const sim = await this.getSIMtariff(thv.infoAddress.regionId, orgId, thv.infoAddress.regionFullName);
        if (!sim) {
          this.logger.error(`Тариф SIM не найден || REGION: ${thv.infoAddress.regionId} || PATH: eissd/main`);
          this.bitrixService.moveToError(lead.id);
          continue;
        }
        const eissdApplication = await this.sendAplication(lead.fio.split(' ')[0], lead.fio.split(' ')[1], lead.number, [shpd, iptv, sim], orgId, thv);

        if (Object.keys(eissdApplication).length > 2) {
          this.logger.log(`Заявка отправлена || ADDRESS: ${lead.address} || PATH: eissd/main`);
          if (thv.result.thv) {
            this.bitrixService.moveToAppointed(lead.id);
          } else {
            this.bitrixService.moveToInStorage(lead.id);
          }
        } else {
          this.logger.error(`Заявка не отправлена || ADDRESS: ${lead.address} || PATH: eissd/main`);
          this.bitrixService.moveToError(lead.id);
        }
      } catch (error) {
        this.logger.error(`Error: ${error} || ADDRESS: ${lead.address} || PATH: eissd/main`);
        this.bitrixService.moveToError(lead.id);
      }
    }
  }
  async authEissd(): Promise<string> {
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
      console.error('Error during authentication:', error);
      throw error;
    }
  }
  async checkTHV(address: string): Promise<ResultThvEissdI> {
    const techId = {
      'БШПД (WBA)': '10063',
      PSTN: '10044',
      PON: '10037',
      FTTx: '10036',
      xDSL: '10035',
    };
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

    // Проверка и извлечение ID района (district)
    let idDistrict = 0;
    let districtFiasId = '';
    let districtName = '';
    let districtObject = '';
    // Получение населенного пунтка
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
    if (!idDistrict) {
      throw new Error('Ошибка в получении id населенного пункта');
    }

    // Получение айди улицы
    const idStreet = await this.streetRepository.GetStreetIDByNameAndDistrictId(infoAddressDadata.street, idDistrict);
    const streetName = infoAddressDadata.street;
    const streetObject = infoAddressDadata.street_type;
    if (!idStreet) {
      throw new Error('Ошибка в получении id населенного пункта');
    }

    // Получение айди дома
    const houseAndBlock = infoAddressDadata.house + (infoAddressDadata.block ? ` ${infoAddressDadata.block}` : '');
    const idHouse = await this.houseRepository.GetStreetIDByNameAndDistrictId(houseAndBlock, idStreet);
    if (!idHouse) {
      throw new Error('Ошибка в получении id населенного пункта');
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

    try {
      const response = await this.sendXMLRequest(requestBody);
      const parsXml = await this.parseXmlResponse(response);

      const validTechNames = ['PON', 'FTTx', 'xDSL', 'WBA', 'DOCSIS'];
      const result = parsXml.CheckConnectionPossibilityAgent[0].ConnectionPoss[0].ConnectionPos.find((pos) => {
        return validTechNames.includes(pos.TechName[0]._text[0]) && ['Y', 'U'].includes(pos.Res[0]._text[0]);
      });

      const formattedResult = result
        ? {
            TechName: result.TechName[0]._text[0],
            Res: result.Res[0]._text[0],
            TechId: techId[result.TechName[0]._text[0]],
            thv: true,
          }
        : { TechName: 'xDSL', Res: 'Y', TechId: '10035', thv: false };

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
    } catch (error) {
      throw new Error(error);
    }
  }
  async getOrgId(regionId: string): Promise<any> {
    const endpoint = 'https://eissd.rt.ru/ajax/orgs/get.default.org.by.region';

    try {
      // Данные запроса
      const requestData = new URLSearchParams({
        regionId,
      });

      console.log(this.sessionId);

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
      console.error('Ошибка при выполнении запроса:', error);
      throw new Error(error instanceof Error ? error.message : 'Неизвестная ошибка');
    }
  }
  // Получение мрф тарифов
  async getSHPDtariffMRF(regionId: string, cityId: string, streetId: string, houseId: string, flat: string, techId: string): Promise<any> {
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
        productRegion: '72',
        productAsrTariffId: response.data.result[0].asrTariffId,
        productTariffName: response.data.result[0].title,
      };

      return result; // Возвращаем данные ответа
    } catch (error) {
      console.error('Ошибка при выполнении запроса:', error);
      throw new Error(error instanceof Error ? error.message : 'Неизвестная ошибка');
    }
  }
  async getIPTVtariffMRF(regionId: string, cityId: string, streetId: string, houseId: string, flat: string, techId: string): Promise<any> {
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
        productRegion: '72',
        productAsrTariffId: response.data.result[0].asrTariffId,
        productTariffName: response.data.result[0].title,
      };

      return result; // Возвращаем данные ответа
    } catch (error) {
      console.error('Ошибка при выполнении запроса:', error);
      throw new Error(error instanceof Error ? error.message : 'Неизвестная ошибка');
    }
  }
  // Получение тарифов
  async getSHPDtariff(regionId: string, districtId: string, techId: string): Promise<any> {
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
      console.log(optionTariff);
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
      console.error('Ошибка при выполнении запроса:', error);
      throw new Error(error instanceof Error ? error.message : 'Неизвестная ошибка');
    }
  }
  async getIPTVtariff(regionId: string, districtId: string, techId: string): Promise<any> {
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
      console.log(optionTariff);
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
      console.error('Ошибка при выполнении запроса:', error);
      throw new Error(error instanceof Error ? error.message : 'Неизвестная ошибка');
    }
  }
  // Получение опций для тарифа
  async getSHPDoptionsTariff(regionId: string, tariffId: string, techId: string): Promise<any> {
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
      console.log(foundOption, techId);
      if (foundOption) {
        const option = response.data.result.options[foundOption];
        result.optionName = option.label;
        result.optionCost = option.pays[techId].cost;
        result.optionFee = option.pays[techId].fee;

        return result;
      }

      return null;
    } catch (error) {
      console.error('Ошибка при выполнении запроса:', error);
      throw new Error(error instanceof Error ? error.message : 'Неизвестная ошибка');
    }
  }
  async getIPTVoptionsTariff(regionId: string, tariffId: string): Promise<any> {
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
      console.error('Ошибка при выполнении запроса:', error);
      throw new Error(error instanceof Error ? error.message : 'Неизвестная ошибка');
    }
  }
  // Получение симки
  async getSIMtariff(region: string, orgId: string, regionFullName: string): Promise<any> {
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

      const result = {
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
      console.error('Ошибка при выполнении запроса:', error);
      throw new Error(error instanceof Error ? error.message : 'Неизвестная ошибка');
    }
  }
  // Создание и отправка заявки
  async sendAplication(name: string, lastname: string, phone: string, tariffs: any[], orgId: string, eissdInfo: ResultThvEissdI): Promise<any> {
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
        requestContent: '',
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
        params: [
          {
            key: 'request_content',
            value: '',
          },
        ],
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

      if (response.data?.errorCode == 401 || response.data?.errorCode == 400) {
        this.sessionId = await this.authEissd();
        return null;
      }

      return response.data; // Возвращаем данные ответа
    } catch (error) {
      console.error('Ошибка при выполнении запроса:', error);
      throw new Error(error instanceof Error ? error.message : 'Неизвестная ошибка');
    }
  }
  private async sendXMLRequest(body: string): Promise<string> {
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
  }
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
      console.error('Error parsing XML:', error);
      throw error; // Выбрасываем ошибку, если XML не удается распарсить
    }
  }
}
