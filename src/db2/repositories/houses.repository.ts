import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { House } from '../entities/house.entity';

@Injectable()
export class HouseRepository {
  constructor(
    @InjectRepository(House, 'EISSD_DB_CONNECTION')
    private readonly houseRepository: Repository<House>,
  ) {}

  // Получение id родительского района по region и name
  async GetStreetIDByNameAndDistrictId(house: string, street_id: number): Promise<number | null> {
    const houseResult = await this.houseRepository.findOne({
      where: {
        street_id: street_id,
        house: ILike(house),
      },
    });

    return house ? houseResult.id : null;
  }
}
