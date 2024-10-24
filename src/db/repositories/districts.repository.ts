import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { District } from '../entities/district.entity';

@Injectable()
export class DistrictsRepository {
  constructor(
    @InjectRepository(District)
    private readonly districtRepository: Repository<District>,
  ) {}

  async getAllDistricts(): Promise<District[]> {
    const districts = await this.districtRepository.find();
    return districts;
  }

  async getDistrictEngNameByFiasID(fiasID: string): Promise<string> {
    const district = await this.districtRepository.findOne({
      where: { id: fiasID },
    });
    return district.engname;
  }

  async getDistrictInfoByEngName(engName: string): Promise<District> {
    const district = await this.districtRepository.findOne({
      where: { engname: engName },
    });
    return district;
  }
}
