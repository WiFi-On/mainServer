import { Module } from '@nestjs/common';
import { EissdService } from './eissd.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

import { EissdController } from './eissd.controller';

@Module({
  imports: [ConfigModule, HttpModule],
  controllers: [EissdController],
  providers: [EissdService],
  exports: [EissdService],
})
export class EissdModule {}
