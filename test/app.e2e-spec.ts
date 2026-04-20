import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

import { AppModule } from './../src/app.module';
import { AllExceptionsFilter } from './../src/common/filters/all-exceptions.filter';

describe('Aerobi API (e2e)', () => {
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

  it('GET /health', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((res) => {
        const body = res.body as {
          status: string;
          timestamp: string;
          uptime: string;
          environment: string;
          version: string;
          memory: { heapUsed: string; heapTotal: string; rss: string };
          database: { status: string; type: string };
        };
        expect(body.status).toBe('ok');
        expect(body.database.status).toBe('ok');
        expect(body.database.type).toBe('postgresql');
        expect(typeof body.timestamp).toBe('string');
        expect(typeof body.uptime).toBe('string');
        expect(typeof body.environment).toBe('string');
        expect(typeof body.version).toBe('string');
        expect(typeof body.memory.heapUsed).toBe('string');
        expect(typeof body.memory.heapTotal).toBe('string');
        expect(typeof body.memory.rss).toBe('string');
      });
  });
});
