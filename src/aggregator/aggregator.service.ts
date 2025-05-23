import { Injectable, Inject } from '@nestjs/common';
import { Tariff } from '../db1/entities/tariff.entity';
import { Provider } from '../db1/entities/provider.entity';
import { District } from '../db1/entities/district.entity';
import { DadataService } from '../dadata/dadata.service';
import { EissdService } from '../eissd/eissd.service';
import * as crypto from 'crypto';
import { TariffsRepository } from '../db1/repositories/tariffs.repository';
import { ProvidersRepository } from '../db1/repositories/providers.repository';
import { DistrictsRepository } from '../db1/repositories/districts.repository';
import { EISSD_PROVIDER_AUTOLEAD } from 'src/eissd/eissd.provider';

@Injectable()
export class AggregatorService {
  constructor(
    private readonly tariffsRepository: TariffsRepository,
    private readonly providersRepository: ProvidersRepository,
    private readonly districtsRepository: DistrictsRepository,
    private readonly dadataService: DadataService,
    @Inject(EISSD_PROVIDER_AUTOLEAD) private readonly eissdService: EissdService,
  ) {}
  // Утилиты
  async hashAddress(address: string): Promise<string> {
    const hash = crypto.createHash('md5').update(address).digest('hex');
    return hash;
  }
  // Для работы с тарифами
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
    const tariffs = await this.tariffsRepository.getTariffsByStreetId(hashAddress);

    // Получаем тарифы avatell(Добавляем, потому что работают на любом адресе)
    const tariffsAvatell = await this.tariffsRepository.getTariffsByProviderId(6);
    tariffs.push(...tariffsAvatell);
    // Если указан список providerIds, фильтруем тарифы по провайдерам
    if (providerIds.length > 0) {
      return tariffs.filter((tariff) => providerIds.includes(tariff.provider.id));
    }

    return tariffs;
  }
  async getTariffsOnAddressByHash(
    hashAddress: string,
    providerIds: number[] = [], // Значение по умолчанию
  ): Promise<Tariff[]> {
    // Получаем тарифы по адресу
    const tariffs = await this.tariffsRepository.getTariffsByStreetId(hashAddress);
    // Получаем тарифы avatell(Добавляем, потому что работают на любом адресе)
    const tariffsAvatell = await this.tariffsRepository.getTariffsByProviderId(6);
    tariffs.push(...tariffsAvatell);
    // Если указан список providerIds, фильтруем тарифы по провайдерам
    if (providerIds.length > 0) {
      return tariffs.filter((tariff) => providerIds.includes(tariff.provider.id));
    }

    return tariffs;
  }
  async getTariffsOnDistrict(engNameDistrict: string): Promise<Tariff[]> {
    const tariffs = await this.tariffsRepository.getTariffsByDistrictEngName(engNameDistrict);
    const tariffsAvatell = await this.tariffsRepository.getTariffsByProviderId(6);

    tariffs.push(...tariffsAvatell);
    return tariffs;
  }
  async getAllTariffsIds(): Promise<number[]> {
    const idsTariffs = await this.tariffsRepository.getAllTariffsIds();

    return idsTariffs;
  }
  // Для работы с провайдерами
  async getProvidersOnAddressByAddress(address: string, providerIds: number[] = []): Promise<Provider[]> {
    const hashAddress = await this.hashAddress(address);

    // Получаем провайдеров, привязанных к адресу
    const providersOnStreet = await this.providersRepository.getProvidersByHashAddress(hashAddress);
    // Создаем массив провайдеров
    let providers: Provider[] = providersOnStreet.map((providerOnStreet) => providerOnStreet.provider);
    providers.push({
      id: 6,
      name: 'Avatell',
      tariffs: [],
    });
    // Если есть список провайдеров для фильтрации
    if (providerIds && providerIds.length > 0) {
      providers = providers.filter((provider) => providerIds.includes(provider.id));
    }

    return providers;
  }
  async getProvidersOnAddressByHash(hashAddress: string, providerIds: number[] = []): Promise<Provider[]> {
    // Получаем провайдеров, привязанных к адресу
    const providersOnStreet = await this.providersRepository.getProvidersByHashAddress(hashAddress);

    // Создаем массив провайдеров
    let providers: Provider[] = providersOnStreet.map((providerOnStreet) => providerOnStreet.provider);
    providers.push({
      id: 6,
      name: 'Avatell',
      tariffs: [],
    });
    // Если есть список провайдеров для фильтрации
    if (providerIds && providerIds.length > 0) {
      providers = providers.filter((provider) => providerIds.includes(provider.id));
    }

    return providers;
  }
  async getProvidersOnDistrict(engNameDistrict: string): Promise<Provider[]> {
    const providers = await this.providersRepository.getProvidersByDistrictEngName(engNameDistrict);

    providers.push({ id: 6, name: 'Avatell', tariffs: [] });
    return providers;
  }
  // Для работы с населенными пунктами
  async getAllDistricts(): Promise<string[]> {
    const districts = await this.districtsRepository.getAllDistricts();
    const districtsEngNames = districts.map((district) => district.engname);

    return districtsEngNames;
  }
  async getDistrictByIP(ip: string): Promise<string[]> {
    const districtsFiasID = await this.dadataService.getDistrictFiasIDonIP(ip);
    const districtEngName = await this.districtsRepository.getDistrictEngNameByFiasID(districtsFiasID);

    return Array(districtEngName);
  }
  async getInfoDistrictByEngName(engName: string): Promise<District> {
    const district = await this.districtsRepository.getDistrictInfoByEngName(engName);
    return district;
  }
  async getDistrictEngNameByFiasID(fiasID: string): Promise<{ engNameDistrict: string }> {
    const district = await this.districtsRepository.getDistrictEngNameByFiasID(fiasID);
    return {
      engNameDistrict: district,
    };
  }
  // Для работы с Ростелеком
  async getTarrifsRTKOnAddress(address: string): Promise<Tariff[] | false> {
    const checkTHV = await this.eissdService.checkTHV(address);
    if (checkTHV.result.thv) {
      return await this.tariffsRepository.getTariffsByDistrictIdAndProviderId(checkTHV.districtFiasId, 10);
    } else {
      return false;
    }
  }
}
