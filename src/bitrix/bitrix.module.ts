import { Module } from '@nestjs/common';
import { BitrixService } from './bitrix.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [ConfigModule, HttpModule],
  providers: [BitrixService],
  exports: [BitrixService],
})
export class BitrixModule {}
