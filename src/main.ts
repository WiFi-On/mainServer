import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as winston from 'winston';
import { WinstonModule } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        // Транспорт для консоли
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(), // Добавляем цвет для удобства чтения
            winston.format.printf(({ timestamp, level, message, context }) => {
              return `${timestamp} [${level}] ${message} ${context ? context : ''}`; // Читабельный формат для консоли
            }),
          ),
        }),
        // Транспорт для файла
        new winston.transports.File({
          filename: 'logs/application.log',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(), // Логирование в формате JSON для файла
          ),
        }),
      ],
    }),
  });

  app.enableCors();
  await app.listen(3010);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
