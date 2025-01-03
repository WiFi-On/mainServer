import { Module } from '@nestjs/common';
import { DadataService } from './dadata.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [ConfigModule, HttpModule],
  providers: [DadataService],
  exports: [DadataService],
})
export class DadataModule {}
