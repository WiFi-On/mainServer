// eissd.provider.ts

import { Provider } from '@nestjs/common';
import { EissdService } from './eissd.service';

import { ConfigService } from '@nestjs/config';
import { DadataService } from 'src/dadata/dadata.service';
import { DistrictRepository } from 'src/db2/repositories/districts.repository';
import { StreetRepository } from 'src/db2/repositories/streets.repository';
import { HouseRepository } from 'src/db2/repositories/houses.repository';
import { HttpService } from '@nestjs/axios';

export const EISSD_PROVIDER_AUTOLEAD = 'EissdProviderAutolead';
export const EISSD_PROVIDER_EXCEL = 'EissdProviderExcel';

export const eissdProviders: Provider[] = [
  {
    provide: EISSD_PROVIDER_AUTOLEAD,
    useFactory: async (
      configService: ConfigService,
      dadataService: DadataService,
      districtRepo: DistrictRepository,
      streetRepo: StreetRepository,
      houseRepo: HouseRepository,
      httpService: HttpService,
    ) => {
      const instance = new EissdService(configService, dadataService, districtRepo, streetRepo, houseRepo, httpService);
      instance.setCredentials({
        cert: configService.get<string>('EISSD_CERT_PRODUCT'),
        key: configService.get<string>('EISSD_KEY_PRODUCT'),
        login: configService.get<string>('EISSD_LOGIN_AUTOLEAD'),
        password: configService.get<string>('EISSD_PASSWORD_AUTOLEAD'),
      });
      await instance.initSession();
      return instance;
    },
    inject: [ConfigService, DadataService, DistrictRepository, StreetRepository, HouseRepository, HttpService],
  },
  {
    provide: EISSD_PROVIDER_EXCEL,
    useFactory: async (
      configService: ConfigService,
      dadataService: DadataService,
      districtRepo: DistrictRepository,
      streetRepo: StreetRepository,
      houseRepo: HouseRepository,
      httpService: HttpService,
    ) => {
      const instance = new EissdService(configService, dadataService, districtRepo, streetRepo, houseRepo, httpService);
      instance.setCredentials({
        cert: configService.get<string>('EISSD_CERT_PRODUCT'),
        key: configService.get<string>('EISSD_KEY_PRODUCT'),
        login: configService.get<string>('EISSD_LOGIN_EXCEL'),
        password: configService.get<string>('EISSD_PASSWORD_EXCEL'),
      });
      await instance.initSession();
      return instance;
    },
    inject: [ConfigService, DadataService, DistrictRepository, StreetRepository, HouseRepository, HttpService],
  },
];
