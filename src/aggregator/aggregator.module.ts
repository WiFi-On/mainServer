//src/modules/aggregator/aggregator.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

import { District } from './entities/district.entity';
import { Provider } from './entities/provider.entity';
import { Tariff } from './entities/tariff.entity';
import { Email } from './entities/email.entity';
import { ProviderOnStreet } from './entities/provideronstreet.entity';
import { Street } from './entities/street.entity';
import { TechologiesOnStreet } from './entities/techologiesonstreet.entity';

import { AggregatorController } from './aggregator.controller';
import { AggregatorService } from './aggregator.service';
import { TariffsRepository } from './repositories/tariffs.repository';
import { ProvidersRepository } from './repositories/providers.repository';
import { DistrictsRepository } from './repositories/districts.repository';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    TypeOrmModule.forFeature([
      District,
      Provider,
      Tariff,
      TariffsRepository,
      Email,
      ProviderOnStreet,
      Street,
      TechologiesOnStreet,
    ]),
  ],
  controllers: [AggregatorController],
  providers: [
    AggregatorService,
    TariffsRepository,
    ProvidersRepository,
    DistrictsRepository,
  ],
  exports: [AggregatorService],
})
export class AggregatorModule {}
