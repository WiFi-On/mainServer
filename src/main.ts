import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as winston from 'winston';
import { WinstonModule } from 'nest-winston';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'; // Импортируем необходимые модули

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        // Транспорт для консоли
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, context }) => {
              return `${timestamp} [${level}] ${message} ${context ? context : ''}`;
            }),
          ),
        }),
        // Транспорт для файла
        new winston.transports.File({
          filename: 'logs/application.log',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
      ],
    }),
  });

  // Включаем глобальный пайп валидации
  app.useGlobalPipes(new ValidationPipe());

  // Настройка CORS
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

  // Настройка Swagger
  const options = new DocumentBuilder()
    .setTitle('API для сайта on-wifi.ru + avatellpartner.ru')
    .setDescription(
      'В основном тут работа с on-wifi.ru. Есть одна ручка для получения заявок от партнеров для avatellpartner.ru.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  // Запускаем приложение на порту 3010
  await app.listen(3010);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
