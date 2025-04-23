import { Module } from '@nestjs/common';
import { EissdService } from './eissd.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

import { EissdController } from './eissd.controller';
import { DadataModule } from '../dadata/dadata.module';
import { DbModule2 } from '../db2/db2.module';
import { BitrixModule } from '../bitrix/bitrix.module';
import { EISSD_PROVIDER_AUTOLEAD, EISSD_PROVIDER_EXCEL, eissdProviders } from './eissd.provider';

@Module({
  imports: [ConfigModule, HttpModule, DadataModule, DbModule2, BitrixModule],
  controllers: [EissdController],
  providers: [EissdService, ...eissdProviders],
  exports: [EISSD_PROVIDER_AUTOLEAD, EISSD_PROVIDER_EXCEL],
})
export class EissdModule {}
