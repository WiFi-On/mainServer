import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Provider } from '../entities/provider.entity';
import { ProviderOnStreet } from '../entities/provideronstreet.entity';
import { Tariff } from '../entities/tariff.entity';
import { District } from '../entities/district.entity';

@Injectable()
export class ProvidersRepository {
  constructor(
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
    @InjectRepository(ProviderOnStreet)
    private readonly providerOnStreetRepository: Repository<ProviderOnStreet>,
    @InjectRepository(Tariff)
    private readonly tariffRepository: Repository<Tariff>,
    @InjectRepository(District)
    private readonly districtRepository: Repository<District>,
  ) {}

  // Функция для получения тарифа по id
  async getProviderById(id: number): Promise<Provider | null> {
    try {
      const provider = await this.providerRepository.findOne({
        where: { id },
      });
      return provider;
    } catch (error) {
      console.error('Ошибка при получении провайдера по ID:', error);
      throw error;
    }
  }

  async getProvidersByHashAddress(
    hashAddress: string,
  ): Promise<ProviderOnStreet[] | null> {
    try {
      const providerOnStreet = await this.providerOnStreetRepository.find({
        where: { street_id: hashAddress },
        relations: ['provider'], // Подгружаем связанные сущности Provider
      });

      return providerOnStreet;
    } catch (error) {
      console.error('Ошибка при получении провайдеров по ID улицы:', error);
      throw error;
    }
  }

  async getProvidersByDistrictEngName(
    districtEngName: string,
  ): Promise<Provider[]> {
    const providers = await this.providerRepository
      .createQueryBuilder('provider')
      .leftJoin('provider.tariffs', 'tariff') // Join for the purpose of filtering
      .leftJoin('tariff.district', 'district') // Join to filter by district
      .select(['provider.id', 'provider.name']) // Select only the id and name
      .where('district.engname = :districtEngName', { districtEngName })
      .getMany();

    return providers;
  }
}
