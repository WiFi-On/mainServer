//src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AggregatorModule } from './aggregator/aggregator.module';
import { ExcelModule } from './excel/excel.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PartnerModule } from './partner/partner.module';
import { DbModule } from './db/db.module';
import { DadataModule } from './dadata/dadata.module';
import { BitrixModule } from './bitrix/bitrix.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE as 'postgres',
      host: 'localhost',
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      synchronize: false,
      logging: ['error'],
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
    }),
    DbModule,
    AggregatorModule,
    ExcelModule,
    UserModule,
    AuthModule,
    PartnerModule,
    DadataModule,
    BitrixModule,
  ],
  providers: [],
})
export class AppModule {}
