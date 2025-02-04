import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'; // Импортируем необходимые модули
import { ConfigService } from '@nestjs/config';
import { LoggerService } from './logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Настройка логирования
  const logger = app.get(LoggerService);

  // Получаем текущий режим
  const configService = app.get(ConfigService);
  const environment = configService.get<string>('ENV');

  // Включаем глобальный пайп валидации
  app.useGlobalPipes(new ValidationPipe());

  // Настройка CORS в зависимости от режима
  if (environment === 'dev') {
    app.enableCors({
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });
  } else {
    app.enableCors({
      origin: (origin, callback) => {
        const allowedOrigins = ['http://localhost:3000', 'http://localhost:3040', 'https://on-wifi.ru', 'https://workworkhellobot.ru'];
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });
  }

  // Настройка Swagger
  const options = new DocumentBuilder()
    .setTitle('Главный монолит on-wifi.ru + avatellpartner.ru')
    .setDescription('В основном тут работа с on-wifi.ru. Есть одна ручка для получения заявок от партнеров для avatellpartner.ru.')
    .addTag('Aggregator', 'Сдесь ручки только для работы с сайтом on-wifi.ru. Получение тарифов, провайдеров и т.д.')
    .addTag(
      'Auth',
      'Здесь ручки для авторизации. Это моя первая авторизация и она сделана через жопу. Тут только один токен(refresh). Я как понял из nest коробки тут работа только с одним токеном.',
    )
    .addTag(
      'Excel',
      'Здесь ручки для работа с екселем. В какие то загружают ексель и получают. В каких то просто получают. Форматы екселей для входа пользователи знают.',
    )
    .addTag('Partner', 'Здесь одна ручка для занесения заявок партнеров. Делал долго, в итоге никто не пользуется, все кидают на почту.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  // Запускаем приложение на порту 3010
  await app.listen(3010);
  logger.log(`Application is running on: ${await app.getUrl()}`, 'Bootstrap');
}

bootstrap();
