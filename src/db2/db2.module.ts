import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// entities
import { Tariff } from './entities/tariff.entity';
import { District } from './entities/district.entity';
import { Street } from './entities/street.entity';
import { House } from './entities/house.entity';
// repositories
import { DistrictRepository } from './repositories/districts.repository';
import { StreetRepository } from './repositories/streets.repository';
import { HouseRepository } from './repositories/houses.repository';

/* Работа с второй базой. Тут вся информация для работы с eissd(Ростелеком). Адреса и тарифы. По факту используется только для работы с адресами.
 Эта база идентична данным которые возвращаются из eissd. Из этого тут плохая форма хранения. */
@Module({
  imports: [TypeOrmModule.forFeature([District, Tariff, Street, House], 'EISSD_DB_CONNECTION')],
  providers: [DistrictRepository, StreetRepository, HouseRepository],
  exports: [DistrictRepository, StreetRepository, HouseRepository],
})
export class DbModule2 {}
