import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tariff } from '../entities/tariff.entity';
import { ProviderOnStreet } from '../entities/provideronstreet.entity';
import { Street } from '../entities/street.entity';

@Injectable()
export class TariffsRepository {
  constructor(
    @InjectRepository(Tariff)
    private readonly tariffRepository: Repository<Tariff>,
  ) {}

  // Функция для получения тарифа по id
  async getTariffById(id: number): Promise<Tariff | null> {
    try {
      const tariff = await this.tariffRepository.findOne({
        where: { id },
        relations: ['provider'], // Указываем связанные сущности
      });
      return tariff;
    } catch (error) {
      console.error('Ошибка при получении тарифа по ID:', error);
      throw error;
    }
  }

  async getTariffsByStreetId(streetId: string): Promise<Tariff[]> {
    return await this.tariffRepository
      .createQueryBuilder('t')
      .innerJoinAndSelect('t.district', 'd')
      .innerJoinAndSelect(ProviderOnStreet, 'ps', 'ps.provider_id = t.provider_id')
      .innerJoinAndSelect(Street, 's', 's.id = ps.street_id AND s.district_id = d.id')
      .innerJoinAndSelect('t.provider', 'p') // Add this line to join and select provider
      .where('s.id = :streetId', { streetId })
      .getMany();
  }

  async getTariffsByDistrictEngName(districtEngName: string): Promise<Tariff[]> {
    try {
      const tariffs = await this.tariffRepository.find({
        where: {
          district: { engname: districtEngName },
        },
        relations: ['provider'],
      });

      return tariffs;
    } catch (error) {
      throw error;
    }
  }

  async getAllTariffsIds(): Promise<number[]> {
    try {
      const tariffs = await this.tariffRepository.find({
        select: ['id'],
      });
      return tariffs.map((tariff) => tariff.id);
    } catch (error) {
      throw error;
    }
  }

  async getTariffsByProviderId(providerId: number): Promise<Tariff[]> {
    try {
      const tariffs = await this.tariffRepository.find({
        where: { provider: { id: providerId } },
        relations: ['provider'],
      });
      return tariffs;
    } catch (error) {
      throw error;
    }
  }

  async getTariffsByDistrictIdAndProviderId(districtId: string, providerId: number): Promise<Tariff[]> {
    try {
      const tariffs = await this.tariffRepository.find({
        where: {
          provider: { id: providerId },
          district: { id: districtId },
        },
        relations: ['provider', 'district'],
      });
      return tariffs;
    } catch (error) {
      throw error;
    }
  }
}
