import { Module } from '@nestjs/common';
import { BitrixService } from './bitrix.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { BitrixController } from './bitrix.controller';

@Module({
  imports: [ConfigModule, HttpModule],
  controllers: [BitrixController],
  providers: [BitrixService],
  exports: [BitrixService],
})
export class BitrixModule {}
