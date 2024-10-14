import { Module } from '@nestjs/common';
import { ExcelService } from './excel.service';
import { AggregatorService } from 'src/aggregator/aggregator.service';
import { DadataService } from 'src/dadata/dadata.service';
import { ExcelController } from './excel.controller';
import { ConfigModule } from '@nestjs/config';

import { AggregatorModule } from 'src/aggregator/aggregator.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [ConfigModule, AggregatorModule, HttpModule],
  controllers: [ExcelController],
  providers: [ExcelService, AggregatorService, DadataService],
  exports: [ExcelService],
})
export class ExcelModule {}
