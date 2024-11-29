import { Module } from '@nestjs/common';
import { EissdService } from './eissd.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

import { EissdController } from './eissd.controller';
import { DadataModule } from '../dadata/dadata.module';
import { DbModule2 } from '../db2/db2.module';
import { BitrixModule } from '../bitrix/bitrix.module';

@Module({
  imports: [ConfigModule, HttpModule, DadataModule, DbModule2, BitrixModule],
  controllers: [EissdController],
  providers: [EissdService],
  exports: [EissdService],
})
export class EissdModule {}
