//src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AggregatorModule } from './aggregator/aggregator.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot(), // Загружаем конфигурацию из .env файла
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE as 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      synchronize: false, // Не использовать в продакшене!
      logging: ['error'],
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
    }),
    AggregatorModule, // Подключите AggregatorModule сюда
  ],
})
export class AppModule {}
