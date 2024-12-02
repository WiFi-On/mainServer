import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Street } from '../entities/street.entity';

@Injectable()
export class StreetRepository {
  constructor(
    @InjectRepository(Street, 'EISSD_DB_CONNECTION')
    private readonly streetRepository: Repository<Street>,
  ) {}

  // Получение id родительского района по region и name
  async GetStreetIDByNameAndDistrictId(name: string, district_id: number): Promise<number | null> {
    const streetResult = await this.streetRepository.findOne({
      where: {
        district_id: district_id,
        name: ILike(name),
      },
    });

    return streetResult ? streetResult.id : null;
  }
}
