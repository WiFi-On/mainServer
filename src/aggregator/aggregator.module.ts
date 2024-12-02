import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

import { AggregatorController } from './aggregator.controller';
import { AggregatorService } from './aggregator.service';
import { DadataService } from '../dadata/dadata.service';
import { UserService } from '../user/user.service';

import { UserModule } from '../user/user.module';
import { DadataModule } from '../dadata/dadata.module';
import { DbModule1 } from '../db1/db1.module'; // Импортируйте ваш DbModule
import { EissdModule } from '../eissd/eissd.module';
import { DbModule2 } from '../db2/db2.module';
import { BitrixModule } from '../bitrix/bitrix.module';

@Module({
  imports: [ConfigModule, HttpModule, UserModule, DadataModule, DbModule1, EissdModule, DbModule2, BitrixModule],
  controllers: [AggregatorController],
  providers: [AggregatorService, DadataService, UserService],
  exports: [AggregatorService],
})
export class AggregatorModule {}
