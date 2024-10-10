// src/aggregator/aggregator.service.ts
import { Injectable } from '@nestjs/common';

import { Tariff } from './entities/tariff.entity';
import { Provider } from './entities/provider.entity';
import { District } from './entities/district.entity';

import { ReturnTHVrtkType } from './models/returnDataService.models';

import { TariffsRepository } from './repositories/tariffs.repository';
import { ProvidersRepository } from './repositories/providers.repository';
import { DistrictsRepository } from './repositories/districts.repository';

import * as crypto from 'crypto'; // Импортируем crypto для хеширования
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AggregatorService {
  constructor(
    private readonly tariffsRepository: TariffsRepository,
    private readonly providersRepository: ProvidersRepository,
    private readonly districtsRepository: DistrictsRepository,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async hashAddress(address: string): Promise<string> {
    const hash = crypto.createHash('md5').update(address).digest('hex');
    return hash;
  }

  async getDistrictFiasIDonIP(ip: string): Promise<string> {
    const url =
      'http://suggestions.dadata.ru/suggestions/api/4_1/rs/iplocate/address';
    const key = this.configService.get('DADATA_KEY');
    const headers = {
      Authorization: `Token ${key}`,
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

  async checkTHVrtk(address: string): Promise<ReturnTHVrtkType> {
    const url = `http://localhost:8080/api/v1/rtkCRM/getTHVonAddress?address=${address}`;
    const headers = {
      'Content-Type': 'application/json',
    };

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, { headers }),
      );

      const data = response.data;
      return data;
    } catch (error) {
      throw new Error(`Не удалось проверить адреc: ${error}`);
    }
  }

  async getTariff(id: number): Promise<Tariff> {
    const tariff = await this.tariffsRepository.getTariffById(id);
    return tariff;
  }

  async getTariffsOnAddressByAddress(
    address: string,
    providerIds: number[] = [], // Значение по умолчанию
  ): Promise<Tariff[]> {
    const hashAddress = await this.hashAddress(address);
    // Получаем тарифы по адресу
    const tariffs =
      await this.tariffsRepository.getTariffsByStreetId(hashAddress);
    // Получаем тарифы avatell(Добавляем, потому что работают на любом адресе)
    const tariffsAvatell =
      await this.tariffsRepository.getTariffsByProviderId(6);
    tariffs.push(...tariffsAvatell);
    // Если указан список providerIds, фильтруем тарифы по провайдерам
    if (providerIds.length > 0) {
      return tariffs.filter((tariff) =>
        providerIds.includes(tariff.provider.id),
      );
    }

    return tariffs;
  }

  async getTariffsOnAddressByHash(
    hashAddress: string,
    providerIds: number[] = [], // Значение по умолчанию
  ): Promise<Tariff[]> {
    // Получаем тарифы по адресу
    const tariffs =
      await this.tariffsRepository.getTariffsByStreetId(hashAddress);
    // Получаем тарифы avatell(Добавляем, потому что работают на любом адресе)
    const tariffsAvatell =
      await this.tariffsRepository.getTariffsByProviderId(6);
    tariffs.push(...tariffsAvatell);
    // Если указан список providerIds, фильтруем тарифы по провайдерам
    if (providerIds.length > 0) {
      return tariffs.filter((tariff) =>
        providerIds.includes(tariff.provider.id),
      );
    }

    return tariffs;
  }

  async getProvidersOnAddressByAddress(
    address: string,
    providerIds: number[] = [],
  ): Promise<Provider[]> {
    const hashAddress = await this.hashAddress(address);

    // Получаем провайдеров, привязанных к адресу
    const providersOnStreet =
      await this.providersRepository.getProvidersByHashAddress(hashAddress);
    // Создаем массив провайдеров
    let providers: Provider[] = providersOnStreet.map(
      (providerOnStreet) => providerOnStreet.provider,
    );
    providers.push({
      id: 6,
      name: 'Avatell',
      tariffs: [],
    });
    // Если есть список провайдеров для фильтрации
    if (providerIds && providerIds.length > 0) {
      providers = providers.filter((provider) =>
        providerIds.includes(provider.id),
      );
    }

    return providers;
  }

  async getProvidersOnAddressByHash(
    hashAddress: string,
    providerIds: number[] = [],
  ): Promise<Provider[]> {
    // Получаем провайдеров, привязанных к адресу
    const providersOnStreet =
      await this.providersRepository.getProvidersByHashAddress(hashAddress);

    // Создаем массив провайдеров
    let providers: Provider[] = providersOnStreet.map(
      (providerOnStreet) => providerOnStreet.provider,
    );
    providers.push({
      id: 6,
      name: 'Avatell',
      tariffs: [],
    });
    // Если есть список провайдеров для фильтрации
    if (providerIds && providerIds.length > 0) {
      providers = providers.filter((provider) =>
        providerIds.includes(provider.id),
      );
    }

    return providers;
  }

  async getProvidersOnDistrict(engNameDistrict: string): Promise<Provider[]> {
    const providers =
      await this.providersRepository.getProvidersByDistrictEngName(
        engNameDistrict,
      );

    providers.push({ id: 6, name: 'Avatell', tariffs: [] });
    return providers;
  }

  async getTariffsOnDistrict(engNameDistrict: string): Promise<Tariff[]> {
    const tariffs =
      await this.tariffsRepository.getTariffsByDistrictEngName(engNameDistrict);
    const tariffsAvatell =
      await this.tariffsRepository.getTariffsByProviderId(6);

    tariffs.push(...tariffsAvatell);
    return tariffs;
  }

  async getAllDistricts(): Promise<string[]> {
    const districts = await this.districtsRepository.getAllDistricts();
    const districtsEngNames = districts.map((district) => district.engname);

    return districtsEngNames;
  }

  async getDistrictByIP(ip: string): Promise<string[]> {
    const districtsFiasID = await this.getDistrictFiasIDonIP(ip);
    const districtEngName =
      await this.districtsRepository.getDistrictEngNameByFiasID(
        districtsFiasID,
      );

    return Array(districtEngName);
  }

  async getInfoDistrictByEngName(engName: string): Promise<District> {
    const district =
      await this.districtsRepository.getDistrictInfoByEngName(engName);
    return district;
  }

  async getDistrictEngNameByFiasID(
    fiasID: string,
  ): Promise<{ engNameDistrict: string }> {
    const district =
      await this.districtsRepository.getDistrictEngNameByFiasID(fiasID);
    return {
      engNameDistrict: district,
    };
  }

  async getTarrifsRTKOnAddress(address: string): Promise<Tariff[] | false> {
    const checkTHV = await this.checkTHVrtk(address);
    if (!checkTHV) {
      return false;
    }
    // Проверка наличия Thv с условием
    const hasThv = checkTHV.Thv.some(
      (item) => item.Res === 'Y' || item.Res === 'U',
    );
    // Проверка, получение, возвращение Тарифов с условием
    if (hasThv) {
      return await this.tariffsRepository.getTariffsByDistrictIdAndProviderId(
        checkTHV.DistrictFiasId,
        10,
      );
    } else {
      return false;
    }
  }
}
