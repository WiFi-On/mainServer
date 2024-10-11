import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as winston from 'winston';
import { WinstonModule } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(), // Логирование в формате JSON для консоли
          ),
        }),
        new winston.transports.File({
          filename: 'logs/application.log',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.printf(({ timestamp, level, message, context }) => {
              const decodedMessage = decodeURIComponent(message); // Декодируем сообщение
              const logEntry = {
                timestamp,
                level,
                message: decodedMessage, // Используем декодированное сообщение
                context,
              };
              return JSON.stringify(logEntry); // Преобразуем в JSON-формат
            }),
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
