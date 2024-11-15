//src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AggregatorModule } from './aggregator/aggregator.module';
import { ExcelModule } from './excel/excel.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PartnerModule } from './partner/partner.module';
import { DbModule1 } from './db1/db.module';
import { DadataModule } from './dadata/dadata.module';
import { BitrixModule } from './bitrix/bitrix.module';
import { ScheduleModule } from './schedule/schedule.module';
import { EissdModule } from './eissd/eissd.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE1 as 'postgres',
      host: process.env.DB_HOST1,
      port: parseInt(process.env.DB_PORT1, 10),
      username: process.env.DB_USERNAME1,
      password: process.env.DB_PASSWORD1,
      database: process.env.DB_DATABASE1,
      synchronize: false,
      logging: ['error'],
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
    }),
    DbModule1,
    AggregatorModule,
    ExcelModule,
    UserModule,
    AuthModule,
    PartnerModule,
    DadataModule,
    BitrixModule,
    ScheduleModule,
    EissdModule,
  ],
  providers: [],
})
export class AppModule {}
