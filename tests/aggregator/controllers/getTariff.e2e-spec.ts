import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';

describe('GetTariffController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/get/tariff (GET) - должен вернуть 400 с описанием ошибки', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/aggregator/get/tariff');

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(['ID не может быть пустым.', 'ID должен быть числом']);
    expect(response.body).toHaveProperty('error', 'Bad Request');
  });

  it('/get/tariff (GET) - должен вернуть тариф по ID', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/aggregator/get/tariff').query({ id: '1' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', 1);
  });

  it('/get/tariff (GET) - должен вернуть 404, если тариф не найден', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/aggregator/get/tariff').query({ id: '123' });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'Тариф не найден. ID: 123');
  });
});
