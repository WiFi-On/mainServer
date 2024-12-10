// nest
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
// service
import { ExcelService } from './excel.service';
import { DadataService } from '../dadata/dadata.service';
import { EmailService } from '../email/email.service';
// controller
import { ExcelController } from './excel.controller';
// module
import { AggregatorModule } from '../aggregator/aggregator.module';
import { DbModule1 } from '../db1/db1.module';
import { EissdModule } from 'src/eissd/eissd.module';

@Module({
  imports: [ConfigModule, AggregatorModule, HttpModule, DbModule1, EissdModule],
  controllers: [ExcelController],
  providers: [ExcelService, DadataService, EmailService],
  exports: [ExcelService],
})
export class ExcelModule {}
