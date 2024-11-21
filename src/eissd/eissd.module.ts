import { Module } from '@nestjs/common';
import { EissdService } from './eissd.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

import { EissdController } from './eissd.controller';
import { DadataModule } from 'src/dadata/dadata.module';
import { DbModule2 } from 'src/db2/db2.module';

@Module({
  imports: [ConfigModule, HttpModule, DadataModule, DbModule2],
  controllers: [EissdController],
  providers: [EissdService],
  exports: [EissdService],
})
export class EissdModule {}
