import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

import { AggregatorController } from './aggregator.controller';
import { AggregatorService } from './aggregator.service';
import { DadataService } from '../dadata/dadata.service';
import { UserService } from 'src/user/user.service';
import { EissdService } from 'src/eissd/eissd.service';

import { UserModule } from '../user/user.module';
import { DadataModule } from 'src/dadata/dadata.module';
import { DbModule1 } from 'src/db1/db1.module'; // Импортируйте ваш DbModule
import { EissdModule } from 'src/eissd/eissd.module';
import { DbModule2 } from 'src/db2/db2.module';

@Module({
  imports: [ConfigModule, HttpModule, UserModule, DadataModule, DbModule1, EissdModule, DbModule2],
  controllers: [AggregatorController],
  providers: [AggregatorService, DadataService, UserService, EissdService],
  exports: [AggregatorService, EissdService],
})
export class AggregatorModule {}
