import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as winston from 'winston';
import { WinstonModule } from 'nest-winston';
import { ValidationPipe } from '@nestjs/common';

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

  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = ['http://localhost:3000', 'https://on-wifi.ru'];
      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(3010);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
