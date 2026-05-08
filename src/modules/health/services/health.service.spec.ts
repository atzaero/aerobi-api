import { ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { HealthService } from './health.service';

import { PrismaService } from '@/prisma/prisma.service';

describe('HealthService', () => {
  let service: HealthService;
  let prisma: { $queryRaw: jest.Mock };
  let config: { get: jest.Mock };

  beforeEach(async () => {
    prisma = { $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]) };
    config = {
      get: jest.fn((key: string, def?: string) => {
        if (key === 'NODE_ENV') return 'test';

        return def;
      }),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        { provide: PrismaService, useValue: prisma },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();

    service = moduleRef.get(HealthService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('execute (success)', () => {
    it('returns the full health payload with status=ok when the DB is reachable', async () => {
      jest.spyOn(process, 'uptime').mockReturnValue(3600 + 15 * 60 + 30); // 1h 15m 30s
      jest.spyOn(process, 'memoryUsage').mockReturnValue({
        heapUsed: 45.23 * 1024 * 1024,
        heapTotal: 78.5 * 1024 * 1024,
        rss: 92.1 * 1024 * 1024,
        external: 0,
        arrayBuffers: 0,
      });

      const result = await service.execute();

      expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
      expect(result.status).toBe('ok');
      expect(result.environment).toBe('test');
      expect(typeof result.version).toBe('string');
      expect(result.version.length).toBeGreaterThan(0);
      expect(result.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
      expect(result.uptime).toBe('1h 15m 30s');
      expect(result.memory.heapUsed).toMatch(/MB$/);
      expect(result.memory.heapTotal).toMatch(/MB$/);
      expect(result.memory.rss).toMatch(/MB$/);
      expect(result.database).toEqual({ status: 'ok', type: 'postgresql' });
    });

    it('falls back to "development" when NODE_ENV is not set', async () => {
      config.get.mockImplementation((_key: string, def?: string) => def);

      const result = await service.execute();

      expect(result.environment).toBe('development');
    });
  });

  describe('execute (failure)', () => {
    it('throws ServiceUnavailableException when the DB check fails', async () => {
      prisma.$queryRaw.mockRejectedValueOnce(new Error('connection refused'));

      await expect(service.execute()).rejects.toBeInstanceOf(
        ServiceUnavailableException,
      );
    });

    it('embeds the error payload with status=error and database.error', async () => {
      prisma.$queryRaw.mockRejectedValueOnce(new Error('connection refused'));

      expect.assertions(5);

      try {
        await service.execute();
      } catch (error) {
        expect(error).toBeInstanceOf(ServiceUnavailableException);
        const response = (error as ServiceUnavailableException).getResponse();

        expect(response).toMatchObject({
          status: 'error',
          database: {
            status: 'error',
            type: 'postgresql',
            error: 'connection refused',
          },
        });
        expect((response as { memory: unknown }).memory).toBeDefined();
        expect((response as { uptime: string }).uptime).toMatch(
          /^\d+h \d+m \d+s$/,
        );
        expect((response as { timestamp: string }).timestamp).toMatch(
          /^\d{4}-\d{2}-\d{2}T/,
        );
      }
    });

    it('stringifies non-Error throwables from Prisma', async () => {
      prisma.$queryRaw.mockRejectedValueOnce('boom');

      try {
        await service.execute();
        fail('expected ServiceUnavailableException');
      } catch (error) {
        const response = (
          error as ServiceUnavailableException
        ).getResponse() as {
          database: { error: string };
        };

        expect(response.database.error).toBe('boom');
      }
    });
  });

  describe('formatters', () => {
    // Exercise private helpers indirectly via execute() to avoid `any` casts.
    it('formats uptime as "Xh Ym Zs" (zero hours)', async () => {
      jest.spyOn(process, 'uptime').mockReturnValue(59);

      const result = await service.execute();

      expect(result.uptime).toBe('0h 0m 59s');
    });

    it('formats uptime with minutes only', async () => {
      jest.spyOn(process, 'uptime').mockReturnValue(5 * 60 + 12);

      const result = await service.execute();

      expect(result.uptime).toBe('0h 5m 12s');
    });

    it('formats bytes as MB for large values', async () => {
      jest.spyOn(process, 'memoryUsage').mockReturnValue({
        heapUsed: 10 * 1024 * 1024,
        heapTotal: 20 * 1024 * 1024,
        rss: 30 * 1024 * 1024,
        external: 0,
        arrayBuffers: 0,
      });

      const result = await service.execute();

      expect(result.memory.heapUsed).toBe('10.00 MB');
      expect(result.memory.heapTotal).toBe('20.00 MB');
      expect(result.memory.rss).toBe('30.00 MB');
    });

    it('formats bytes as KB for mid-range values', async () => {
      jest.spyOn(process, 'memoryUsage').mockReturnValue({
        heapUsed: 2048,
        heapTotal: 4096,
        rss: 8192,
        external: 0,
        arrayBuffers: 0,
      });

      const result = await service.execute();

      expect(result.memory.heapUsed).toBe('2.00 KB');
      expect(result.memory.heapTotal).toBe('4.00 KB');
      expect(result.memory.rss).toBe('8.00 KB');
    });

    it('formats bytes as B for very small values', async () => {
      jest.spyOn(process, 'memoryUsage').mockReturnValue({
        heapUsed: 512,
        heapTotal: 800,
        rss: 900,
        external: 0,
        arrayBuffers: 0,
      });

      const result = await service.execute();

      expect(result.memory.heapUsed).toBe('512.00 B');
      expect(result.memory.heapTotal).toBe('800.00 B');
      expect(result.memory.rss).toBe('900.00 B');
    });
  });
});
