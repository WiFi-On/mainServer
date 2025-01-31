import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as path from 'path';

// Модули
import { AggregatorModule } from './aggregator/aggregator.module';
import { ExcelModule } from './excel/excel.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PartnerModule } from './partner/partner.module';
import { DbModule1 } from './db1/db1.module';
import { DbModule2 } from './db2/db2.module';
import { DadataModule } from './dadata/dadata.module';
import { BitrixModule } from './bitrix/bitrix.module';
import { ScheduleModule } from './schedule/schedule.module';
import { EissdModule } from './eissd/eissd.module';
import { ScheduleModule as ScheduleModuleNest } from '@nestjs/schedule';
import { SchedulerModule } from './scheduler/scheduler.module';

@Module({
  imports: [
    // Модуль для интервального запуска задач
    ScheduleModuleNest.forRoot(),

    // Загрузка конфигурации из файла .env
    ConfigModule.forRoot(),

    // Подключение к базе данных 1
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST1,
      port: parseInt(process.env.DB_PORT1, 10),
      username: process.env.DB_USERNAME1,
      password: process.env.DB_PASSWORD1,
      database: process.env.DB_DATABASE1,
      synchronize: false,
      logging: ['error'],
      entities: [path.join(__dirname, '**', '*.entity{.ts,.js}')], // Путь к сущностям
    }),

    // Подключение к базе данных 2
    TypeOrmModule.forRoot({
      name: 'EISSD_DB_CONNECTION', // Имя подключения для второй базы данных
      type: 'postgres',
      host: process.env.DB_HOST2,
      port: parseInt(process.env.DB_PORT2, 10),
      username: process.env.DB_USERNAME2,
      password: process.env.DB_PASSWORD2,
      database: process.env.DB_DBNAME2,
      synchronize: false,
      logging: ['error'],
      entities: [path.join(__dirname, '**', '*.entity{.ts,.js}')], // Путь к сущностям
    }),

    // Другие модули
    DbModule1,
    DbModule2,
    AggregatorModule,
    ExcelModule,
    UserModule,
    AuthModule,
    PartnerModule,
    DadataModule,
    BitrixModule,
    ScheduleModule,
    EissdModule,
    SchedulerModule,
  ],
  providers: [],
})
export class AppModule {}
