import { HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Cache } from 'cache-manager';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

import { AVIASCAN_READINGS_CACHE_PREFIX } from '../utils/build-aviascan-cache-key.util';
import { AviascanHttpService } from './aviascan-http.service';
import { AviascanReadingsService } from './aviascan-readings.service';

const BASE_URL = 'https://aviascanapi.lmpierin.com.br';

const UPSTREAM_PAGE = {
  data: [
    {
      id: 1,
      registration: 'PS-KDV',
      aerodrome: 'SSCF',
      image_path: '/uploads/88768ccd-a244-4319-b9b2-7639a3e7d65d.jpg',
    },
  ],
  meta: {
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
};

function makeErrorMessages(): ErrorMessageService {
  return {
    getMessage: jest.fn(() => 'erro externo'),
  } as unknown as ErrorMessageService;
}

describe('AviascanReadingsService', () => {
  let service: AviascanReadingsService;
  let requestJson: jest.Mock;
  let getBaseUrl: jest.Mock;
  let cacheGet: jest.Mock;
  let cacheSet: jest.Mock;
  let configGet: jest.Mock;

  beforeEach(() => {
    requestJson = jest.fn();
    getBaseUrl = jest.fn().mockReturnValue(BASE_URL);
    cacheGet = jest.fn().mockResolvedValue(undefined);
    cacheSet = jest.fn().mockResolvedValue(undefined);
    configGet = jest.fn((_key: string, def?: unknown) => def);

    const http = {
      requestJson,
      getBaseUrl,
    } as unknown as AviascanHttpService;
    const cache = { get: cacheGet, set: cacheSet } as unknown as Cache;
    const config = { get: configGet } as unknown as ConfigService;

    service = new AviascanReadingsService(
      http,
      makeErrorMessages(),
      cache,
      config,
    );
  });

  it('forwards pagination and filters to AviaScan on cache miss', async () => {
    requestJson.mockResolvedValue(UPSTREAM_PAGE);

    await service.execute({
      page: 2,
      limit: 25,
      registration: 'PS-KDV',
      aerodrome: 'SSCF',
      start_date: '2026-05-01',
      end_date: '2026-05-31',
    });

    expect(requestJson).toHaveBeenCalledWith({
      method: 'GET',
      path: '/api/readings/paginated',
      query: {
        page: 2,
        limit: 25,
        registration: 'PS-KDV',
        aerodrome: 'SSCF',
        start_date: '2026-05-01',
        end_date: '2026-05-31',
      },
    });
  });

  it('defaults page to 1 and limit to 10 when not provided', async () => {
    requestJson.mockResolvedValue(UPSTREAM_PAGE);

    await service.execute({});

    expect(requestJson).toHaveBeenCalledWith({
      method: 'GET',
      path: '/api/readings/paginated',
      query: {
        page: 1,
        limit: 10,
        registration: undefined,
        aerodrome: undefined,
        start_date: undefined,
        end_date: undefined,
      },
    });
  });

  it('maps image_path and returns the envelope on cache miss', async () => {
    requestJson.mockResolvedValue(UPSTREAM_PAGE);

    const actual = await service.execute({ page: 1 });

    expect(actual.data[0].image_path).toBe(
      'https://aviascanapi.lmpierin.com.br/uploads/88768ccd-a244-4319-b9b2-7639a3e7d65d.jpg',
    );
    expect(actual.meta).toEqual(UPSTREAM_PAGE.meta);
  });

  it('caches the mapped result with the default TTL on cache miss', async () => {
    requestJson.mockResolvedValue(UPSTREAM_PAGE);

    const result = await service.execute({ page: 1, aerodrome: 'SSCF' });

    expect(cacheSet).toHaveBeenCalledTimes(1);
    const [key, value, ttl] = cacheSet.mock.calls[0] as [
      string,
      unknown,
      number,
    ];
    expect(key).toContain(AVIASCAN_READINGS_CACHE_PREFIX);
    expect(key).toContain('aerodrome=SSCF');
    expect(value).toEqual(result);
    expect(ttl).toBe(60_000);
  });

  it('returns the cached value and skips the upstream on cache hit', async () => {
    const cachedPage = { data: [], meta: UPSTREAM_PAGE.meta };
    cacheGet.mockResolvedValue(cachedPage);

    const actual = await service.execute({ page: 1 });

    expect(actual).toBe(cachedPage);
    expect(requestJson).not.toHaveBeenCalled();
    expect(cacheSet).not.toHaveBeenCalled();
  });

  it('honours AVIASCAN_CACHE_TTL_MS when set', async () => {
    requestJson.mockResolvedValue(UPSTREAM_PAGE);
    configGet.mockImplementation((key: string, def?: unknown) =>
      key === 'AVIASCAN_CACHE_TTL_MS' ? '30000' : def,
    );

    await service.execute({ page: 1 });

    const [, , ttl] = cacheSet.mock.calls[0] as [string, unknown, number];
    expect(ttl).toBe(30_000);
  });

  it('falls back to the default TTL when AVIASCAN_CACHE_TTL_MS is invalid', async () => {
    requestJson.mockResolvedValue(UPSTREAM_PAGE);
    configGet.mockImplementation((key: string, def?: unknown) =>
      key === 'AVIASCAN_CACHE_TTL_MS' ? 'not-a-number' : def,
    );

    await service.execute({ page: 1 });

    const [, , ttl] = cacheSet.mock.calls[0] as [string, unknown, number];
    expect(ttl).toBe(60_000);
  });

  it('throws CustomHttpException (EXTERNAL_SERVICE_FAILED) when upstream shape is unexpected', async () => {
    requestJson.mockResolvedValue({ unexpected: true });

    const error = await service.execute({ page: 1 }).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(CustomHttpException);
    const custom = error as CustomHttpException;
    expect(custom.getErrorCode()).toBe(ErrorCode.EXTERNAL_SERVICE_FAILED);
    expect(custom.getStatus()).toBe(HttpStatus.BAD_GATEWAY);
    expect(cacheSet).not.toHaveBeenCalled();
  });

  it('degrades to a cache miss when cache.get throws', async () => {
    const warnSpy = jest
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => {});
    cacheGet.mockRejectedValue(new Error('store down'));
    requestJson.mockResolvedValue(UPSTREAM_PAGE);

    const actual = await service.execute({ page: 1 });

    expect(requestJson).toHaveBeenCalledTimes(1);
    expect(actual.meta).toEqual(UPSTREAM_PAGE.meta);
    warnSpy.mockRestore();
  });

  it('still returns the result when cache.set throws', async () => {
    const warnSpy = jest
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => {});
    cacheSet.mockRejectedValue(new Error('store down'));
    requestJson.mockResolvedValue(UPSTREAM_PAGE);

    const actual = await service.execute({ page: 1 });

    expect(actual.meta).toEqual(UPSTREAM_PAGE.meta);
    warnSpy.mockRestore();
  });
});
