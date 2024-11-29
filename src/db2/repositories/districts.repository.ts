import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { District } from '../entities/district.entity';

@Injectable()
export class DistrictRepository {
  constructor(
    @InjectRepository(District, 'EISSD_DB_CONNECTION')
    private readonly districtRepository: Repository<District>,
  ) {}

  // Получение id района по region и name
  async getDistrictIDByRegionAndName(region: string, name: string, object: string): Promise<number | null> {
    const districtResult = await this.districtRepository.findOne({
      where: {
        region: region,
        name: name,
        object: object,
      },
    });

    // Если результат найден, возвращаем id, иначе возвращаем null
    return districtResult ? districtResult.id : null;
  }

  // Получение id района по parentID и name
  async getDistrictIDByParentIDandName(parentID: number, name: string, object: string): Promise<number | null> {
    const districtResult = await this.districtRepository.findOne({
      where: {
        parent_id: parentID,
        name: name,
        object: object,
      },
    });
    return districtResult ? districtResult.id : null;
  }

  // Получение id родительского района по region и name
  async getParentIDByRegionAndName(region: string, name: string, object: string): Promise<number | null> {
    const districtResult = await this.districtRepository.findOne({
      where: {
        region: region,
        name: name,
        object: object,
      },
    });

    return districtResult ? districtResult.parent_id : null;
  }

  // Получение id родительского района по districtID
  async getParentIDByDistrictID(districtID: number, object: string): Promise<number | null> {
    const districtResult = await this.districtRepository.findOne({
      where: {
        id: districtID,
        object: object,
      },
    });

    return districtResult ? districtResult.parent_id : null;
  }
}
