import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

import { AppModule } from '@/app.module';
import { AllExceptionsFilter } from '@/common/filters/all-exceptions.filter';

describe('ANAC Pilot License (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/anac/pilot-license (GET) - deve retornar 400 sem parâmetros', () => {
    return request(app.getHttpServer()).get('/anac/pilot-license').expect(400);
  });

  it('/anac/pilot-license (GET) - deve retornar 400 sem CPF', () => {
    return request(app.getHttpServer())
      .get('/anac/pilot-license?canac=123456')
      .expect(400);
  });

  it('/anac/pilot-license (GET) - deve retornar 400 sem CANAC', () => {
    return request(app.getHttpServer())
      .get('/anac/pilot-license?cpf=123.456.789-00')
      .expect(400);
  });

  // Nota: Testes de sucesso são difíceis sem mock da API da ANAC
  // Testes unitários dos services cobrem a lógica de scraping
});
