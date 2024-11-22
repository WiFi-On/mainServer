import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import axios, { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { DadataService } from 'src/dadata/dadata.service';
import { DistrictRepository } from 'src/db2/repositories/districts.repository';
import { StreetRepository } from 'src/db2/repositories/streets.repository';
import { HouseRepository } from 'src/db2/repositories/houses.repository';
import { ResultThvEissdI } from 'src/eissd/interfaces';
import * as https from 'https';
import * as fs from 'fs';
import { xml2js } from 'xml-js';
import { URLSearchParams } from 'url';

@Injectable()
export class EissdService {
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
  }

  private readonly pathKeyProduct: string;
  private readonly pathCertProduct: string;
  private readonly pathKeyDev: string;
  private readonly pathCertDev: string;

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
    // Получение населенного пунтка
    if (infoAddressDadata.area && infoAddressDadata.city) {
      const areaId = await this.districtRepository.getDistrictIDByRegionAndName(regionId, infoAddressDadata.area);
      const cityId = await this.districtRepository.getDistrictIDByParentIDandName(areaId, infoAddressDadata.city);
      if (!cityId) {
        throw new Error('Ошибка в получении id населенного пункта');
      }

      idDistrict = cityId;
      districtFiasId = infoAddressDadata.city_fias_id;
    } else if (infoAddressDadata.city && infoAddressDadata.settlement) {
      const cityId = await this.districtRepository.getDistrictIDByRegionAndName(regionId, infoAddressDadata.city);
      const settlementId = await this.districtRepository.getDistrictIDByParentIDandName(
        cityId,
        infoAddressDadata.settlement,
      );
      if (!settlementId) {
        throw new Error('Ошибка в получении id населенного пункта');
      }

      idDistrict = settlementId;
      districtFiasId = infoAddressDadata.settlement_fias_id;
    } else if (infoAddressDadata.area && infoAddressDadata.settlement) {
      const areaId = await this.districtRepository.getDistrictIDByRegionAndName(regionId, infoAddressDadata.area);
      const settlementId = await this.districtRepository.getDistrictIDByParentIDandName(
        areaId,
        infoAddressDadata.settlement,
      );
      console.log(areaId, settlementId, ' 3 условие');
      if (!settlementId) {
        throw new Error('Ошибка в получении id населенного пункта');
      }

      idDistrict = settlementId;
      districtFiasId = infoAddressDadata.settlement_fias_id;
    } else if (infoAddressDadata.city) {
      console.log(regionId, infoAddressDadata.city);
      const cityId = await this.districtRepository.getDistrictIDByRegionAndName(regionId, infoAddressDadata.city);
      console.log(cityId, ' 4 условие');
      if (!cityId) {
        throw new Error('Ошибка в получении id населенного пункта');
      }

      idDistrict = cityId;
      districtFiasId = infoAddressDadata.city_fias_id;
    } else {
      throw new Error('Ошибка в получении id населенного пункта');
    }

    // Получение айди улицы
    const idStreet = await this.streetRepository.GetStreetIDByNameAndDistrictId(infoAddressDadata.street, idDistrict);
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
      const result = parsXml.CheckConnectionPossibilityAgent[0].ConnectionPoss[0].ConnectionPos.map((pos) => ({
        TechName: pos.TechName[0]._text[0],
        Res: pos.Res[0]._text[0],
      }));

      return {
        result: result,
        districtFiasId: districtFiasId,
        localIds: {
          regionId: regionId,
          cityId: idDistrict.toString(),
          streetId: idStreet.toString(),
          houseId: idHouse.toString(),
          flat: infoAddressDadata.flat,
        },
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  async getSHPDtariff(
    regionId: string,
    cityId: string,
    streetId: string,
    houseId: string,
    flat: string,
    techName: string,
  ): Promise<any> {
    const endpoint = 'https://eissd.rt.ru/mpz/ajax/get_mrf_tariffs_list';
    const SESSION_ID = 'ZTAWPTSJ6QDQ3QOT9VN4GFDVE88509GLYVJRC3YUO6NPVC3B0UXVBR6E1J2Q2855';
    const techId = {
      'БШПД (WBA)': '10063',
      PSTN: '10044',
      PON: '10037',
      FTTx: '10036',
      xDSL: '10035',
    };

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
        technology: techId[techName],
        svcClassIds: '1',
      });

      // Отправка POST-запроса
      const response = await axios.post(endpoint, requestData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          Cookie: `SESSION_ID=${SESSION_ID}`, // Передаём SESSION_ID в Cookie
        },
      });

      return response.data.result[0]; // Возвращаем данные ответа
    } catch (error) {
      console.error('Ошибка при выполнении запроса:', error);
      throw new Error(error instanceof Error ? error.message : 'Неизвестная ошибка');
    }
  }

  async getIPTVtariff(): Promise<any> {
    const endpoint = 'https://eissd.rt.ru/mpz/ajax/get_mrf_tariffs_list';
    const SESSION_ID = 'ZTAWPTSJ6QDQ3QOT9VN4GFDVE88509GLYVJRC3YUO6NPVC3B0UXVBR6E1J2Q2855';
    const techId = {
      'БШПД (WBA)': '10063',
      PSTN: '10044',
      PON: '10037',
      FTTx: '10036',
      xDSL: '10035',
    };

    try {
      // Данные запроса
      const requestData = new URLSearchParams({
        region: '72',
        cityId: '',
        streetId: '',
        houseId: '',
        house: '',
        flat: '',
        isNew: 'false',
        channelId: '68',
        technology: techId.PON,
        svcClassIds: '2',
      });

      // Отправка POST-запроса
      const response = await axios.post(endpoint, requestData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          Cookie: `SESSION_ID=${SESSION_ID}`, // Передаём SESSION_ID в Cookie
        },
      });

      return response.data.result[0]; // Возвращаем данные ответа
    } catch (error) {
      console.error('Ошибка при выполнении запроса:', error);
      throw new Error(error instanceof Error ? error.message : 'Неизвестная ошибка');
    }
  }

  async getSIMtariff(region: string): Promise<any> {
    const endpoint = 'https://eissd.rt.ru/ajax/mvno/get.tp.list';
    const SESSION_ID = 'ZTAWPTSJ6QDQ3QOT9VN4GFDVE88509GLYVJRC3YUO6NPVC3B0UXVBR6E1J2Q2855';
    const mvnoRegions = {
      '02': '14',
      '43': '38',
      '12': '49',
      '13': '50',
      '52': '55',
      '56': '59',
      '58': '61',
      '63': '66',
      '64': '68',
      '16': '76',
      '18': '81',
      '73': '82',
      '21': '86',
      '28': '11',
      '79': '23',
      '41': '34',
      '49': '48',
      '25': '62',
      '14': '69',
      '65': '70',
      '27': '83',
      '87': '87',
      '50': '52',
      '20': '85',
      '26': '73',
      '15': '71',
      '61': '64',
      '23': '43',
      '09': '35',
      '08': '32',
      '07': '30',
      '06': '27',
      '05': '22',
      '34': '19',
      '30': '13',
      '01': '08',
      '76': '89',
      '71': '79',
      '69': '77',
      '68': '75',
      '67': '72',
      '62': '65',
      '57': '60',
      '48': '47',
      '46': '45',
      '44': '42',
      '40': '33',
      '37': '26',
      '36': '21',
      '33': '18',
      '32': '16',
      '31': '15',
      '89': '04',
      '74': '07',
      '86': '06',
      '72': '05',
      '66': '01',
      '59': '03',
      '45': '02',
      '19': '84',
      '17': '80',
      '70': '78',
      '55': '58',
      '54': '57',
      '24': '44',
      '42': '37',
      '38': '28',
      '75': '24',
      '03': '17',
      '22': '10',
      '04': '09',
      '78': '67',
      '60': '63',
      '53': '56',
      '51': '53',
      '47': '46',
      '11': '39',
      '10': '36',
      '35': '20',
      '29': '12',
    };

    try {
      // Данные запроса
      const requestData = new URLSearchParams({
        orgId: '2001455',
        isPhys: 'true',
        mvnoRegion: mvnoRegions[region],
      });

      // Отправка POST-запроса
      const response = await axios.post(endpoint, requestData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          Cookie: `SESSION_ID=${SESSION_ID}`, // Передаём SESSION_ID в Cookie
        },
      });
      const result = response.data.result;

      for (let i = 0; i < result.length; i++) {
        if (result[i].show) {
          return result[i];
        }
      }

      return null;
    } catch (error) {
      console.error('Ошибка при выполнении запроса:', error);
      throw new Error(error instanceof Error ? error.message : 'Неизвестная ошибка');
    }
  }

  async sendAplication(
    name: string,
    lastname: string,
    phone: string,
    channelId: string,
    tariffs: any[],
    orgId: any,
    eissdInfo: any,
  ): Promise<any> {
    const endpoint = 'https://eissd.rt.ru/sales/api/ajax/save-order';
    const SESSION_ID = 'ZTAWPTSJ6QDQ3QOT9VN4GFDVE88509GLYVJRC3YUO6NPVC3B0UXVBR6E1J2Q2855';

    try {
      // Данные запроса
      const requestData = {
        contactFirstName: name,
        contactLastName: lastname,
        contactPhone: phone,
        channelId: channelId,
        orgId: orgId,
        regionId: eissdInfo['region'],
        cityId: eissdInfo['idDistrict'],
        city: eissdInfo['district'],
        streetId: eissdInfo['idStreet'],
        street: eissdInfo['street'],
        house: eissdInfo['house'],
        houseId: eissdInfo['idHouse'],
        flat: eissdInfo['flat'],
        clientLastName: lastname,
        clientFirstName: name,
        products: tariffs,
        wishTimeStart: '10.04.2024 21:30:00',
        wishTimeEnd: '10.04.2024 22:00:00',
      };

      // Отправка POST-запроса
      const response = await axios.post(endpoint, requestData, {
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          Cookie: `SESSION_ID=${SESSION_ID}`, // Передаём SESSION_ID в Cookie
        },
      });

      return response.data; // Возвращаем данные ответа
    } catch (error) {
      console.error('Ошибка при выполнении запроса:', error);
      throw new Error(error instanceof Error ? error.message : 'Неизвестная ошибка');
    }
  }

  async getOrgId(regionId: string): Promise<any> {
    const endpoint = 'https://eissd.rt.ru/ajax/orgs/get.default.org.by.region';
    const SESSION_ID = 'ZTAWPTSJ6QDQ3QOT9VN4GFDVE88509GLYVJRC3YUO6NPVC3B0UXVBR6E1J2Q2855';

    try {
      // Данные запроса
      const requestData = new URLSearchParams({
        regionId,
      });

      // Отправка POST-запроса
      const response = await axios.post(endpoint, requestData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          Cookie: `SESSION_ID=${SESSION_ID}`, // Передаём SESSION_ID в Cookie
        },
      });

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
