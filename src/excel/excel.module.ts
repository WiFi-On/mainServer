// nest
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
// service
import { ExcelService } from './excel.service';
import { DadataService } from 'src/dadata/dadata.service';
import { AggregatorService } from 'src/aggregator/aggregator.service';
import { EmailService } from 'src/email/email.service';
// controller
import { ExcelController } from './excel.controller';
// module
import { AggregatorModule } from 'src/aggregator/aggregator.module';
import { DbModule } from 'src/db/db.module';

@Module({
  imports: [ConfigModule, AggregatorModule, HttpModule, DbModule],
  controllers: [ExcelController],
  providers: [ExcelService, AggregatorService, DadataService, EmailService],
  exports: [ExcelService],
})
export class ExcelModule {}
