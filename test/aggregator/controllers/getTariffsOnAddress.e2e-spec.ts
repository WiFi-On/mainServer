import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';

describe('GetTariffOnAddressController (e2e)', () => {
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

  it('/get/tariffs/onAddress (GET) - Должен вернуть 400 с описанием ошибки', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/aggregator/get/tariffs/onAddress');

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(['Адрес должен быть строкой.', 'Адрес не может быть пустым.']);
    expect(response.body).toHaveProperty('error', 'Bad Request');
  });

  it('/get/tariffs/onAddress (GET) - Должен вернуть массив тарифов по адресу', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/aggregator/get/tariffs/onAddress').query({ address: 'г Тюмень, ул Широтная, д 100' });

    expect(response.status).toBe(200);
    expect(response.body[0]).toHaveProperty('id');
    expect(response.body.length).toBeGreaterThan(5);
  });

  it('/get/tariffs/onAddress (GET) - Должен вернуть массив тарифов по адресу и оф', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/aggregator/get/tariffs/onAddress').query({ address: 'г Тюмень, ул Широтная, д 100' });

    expect(response.status).toBe(200);
    expect(response.body[0]).toHaveProperty('id');
    expect(response.body.length).toBeGreaterThan(5);
  });
});
