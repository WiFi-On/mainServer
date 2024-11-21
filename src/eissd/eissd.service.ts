import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { DadataService } from 'src/dadata/dadata.service';
import { DistrictRepository } from 'src/db2/repositories/districts.repository';
import { StreetRepository } from 'src/db2/repositories/streets.repository';
import { HouseRepository } from 'src/db2/repositories/houses.repository';
import { ResultThvEissdI } from 'src/eissd/interfaces';
import * as https from 'https';
import * as fs from 'fs';
import { xml2js } from 'xml-js';

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
    this.eissdURLprod = this.configService.get<string>('EISSD_URL_PROD');
    this.eissdURLdev = this.configService.get<string>('EISSD_URL_DEV');
  }

  private readonly pathKeyProduct: string;
  private readonly pathCertProduct: string;
  private readonly pathKeyDev: string;
  private readonly pathCertDev: string;
  private readonly eissdURLprod: string;
  private readonly eissdURLdev: string;

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
      };
    } catch (error) {
      throw new Error(error);
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
