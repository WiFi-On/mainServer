import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

import { AggregatorController } from './aggregator.controller';
import { AggregatorService } from './aggregator.service';
import { DadataService } from '../dadata/dadata.service';
import { UserService } from 'src/user/user.service';

import { UserModule } from '../user/user.module';
import { DadataModule } from 'src/dadata/dadata.module';
import { DbModule1 } from 'src/db1/db.module'; // Импортируйте ваш DbModule

@Module({
  imports: [ConfigModule, HttpModule, UserModule, DadataModule, DbModule1],
  controllers: [AggregatorController],
  providers: [AggregatorService, DadataService, UserService],
  exports: [AggregatorService],
})
export class AggregatorModule {}
