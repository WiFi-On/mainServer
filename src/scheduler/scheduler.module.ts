import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { EissdModule } from 'src/eissd/eissd.module';
import { ConfigModule } from '@nestjs/config';
import { BitrixModule } from 'src/bitrix/bitrix.module';

@Module({
  imports: [EissdModule, BitrixModule, ConfigModule],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}
