import { HttpService } from '@nestjs/axios';
import { HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { of, throwError } from 'rxjs';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

import { AviascanHttpService } from './aviascan-http.service';

function makeConfig(values: Record<string, string> = {}): ConfigService {
  return {
    get: jest.fn((key: string, def?: unknown) => values[key] ?? def),
  } as unknown as ConfigService;
}

function makeErrorMessages(): ErrorMessageService {
  return {
    getMessage: jest.fn(() => 'erro externo'),
  } as unknown as ErrorMessageService;
}

describe('AviascanHttpService', () => {
  let service: AviascanHttpService;
  let httpRequest: jest.Mock;

  beforeEach(() => {
    httpRequest = jest.fn();
    const http = { request: httpRequest } as unknown as HttpService;
    service = new AviascanHttpService(http, makeConfig(), makeErrorMessages());
  });

  it('uses default base URL and does not send x-api-key when unset', async () => {
    httpRequest.mockReturnValue(of({ status: 200, data: { ok: true } }));

    const actual = await service.requestJson({
      method: 'GET',
      path: '/api/readings/paginated',
      query: { page: 1, limit: 10 },
    });

    expect(actual).toEqual({ ok: true });
    const calls = httpRequest.mock.calls as unknown as Array<
      [
        {
          method: string;
          url: string;
          headers: Record<string, string | undefined>;
          params?: Record<string, string>;
        },
      ]
    >;
    const req = calls[0][0];
    expect(req.method).toBe('GET');
    expect(req.url).toBe(
      'https://aviascanapi.lmpierin.com.br/api/readings/paginated',
    );
    expect(req.headers['x-api-key']).toBeUndefined();
    expect(req.params).toEqual({ page: '1', limit: '10' });
  });

  it('honours AVIASCAN_API_BASE_URL and strips trailing slash', async () => {
    const http = { request: httpRequest } as unknown as HttpService;
    const svc = new AviascanHttpService(
      http,
      makeConfig({ AVIASCAN_API_BASE_URL: 'https://example.test/' }),
      makeErrorMessages(),
    );
    httpRequest.mockReturnValue(of({ status: 200, data: {} }));

    await svc.requestJson({ method: 'GET', path: '/api/readings/paginated' });

    const calls = httpRequest.mock.calls as unknown as Array<[{ url: string }]>;
    expect(calls[0][0].url).toBe('https://example.test/api/readings/paginated');
  });

  it('omits undefined and empty query params', async () => {
    httpRequest.mockReturnValue(of({ status: 200, data: {} }));

    await service.requestJson({
      method: 'GET',
      path: '/api/readings/paginated',
      query: { page: 1, registration: undefined, aerodrome: '' },
    });

    const calls = httpRequest.mock.calls as unknown as Array<
      [{ params?: Record<string, string> }]
    >;
    expect(calls[0][0].params).toEqual({ page: '1' });
  });

  it('parses JSON when upstream returns a string body', async () => {
    httpRequest.mockReturnValue(
      of({ status: 200, data: '{"data":[],"meta":{}}' }),
    );

    const actual = await service.requestJson({
      method: 'GET',
      path: '/api/readings/paginated',
    });

    expect(actual).toEqual({ data: [], meta: {} });
  });

  it('throws CustomHttpException with EXTERNAL_SERVICE_FAILED, preserving upstream 4xx status', async () => {
    httpRequest.mockReturnValue(
      of({ status: 404, data: { message: 'not found' } }),
    );

    const error = await service
      .requestJson({ method: 'GET', path: '/api/readings/paginated' })
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(CustomHttpException);
    const custom = error as CustomHttpException;
    expect(custom.getErrorCode()).toBe(ErrorCode.EXTERNAL_SERVICE_FAILED);
    expect(custom.getStatus()).toBe(HttpStatus.NOT_FOUND);
  });

  it('maps AviaScan 5xx to a 502 CustomHttpException', async () => {
    httpRequest.mockReturnValue(of({ status: 502, data: {} }));

    const error = await service
      .requestJson({ method: 'GET', path: '/api/readings/paginated' })
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(CustomHttpException);
    expect((error as CustomHttpException).getStatus()).toBe(
      HttpStatus.BAD_GATEWAY,
    );
  });

  it('maps axios network error to a 502 CustomHttpException', async () => {
    const errorLogSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => {});
    httpRequest.mockReturnValue(throwError(() => new AxiosError('network')));

    const error = await service
      .requestJson({ method: 'GET', path: '/api/readings/paginated' })
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(CustomHttpException);
    expect((error as CustomHttpException).getStatus()).toBe(
      HttpStatus.BAD_GATEWAY,
    );

    errorLogSpy.mockRestore();
  });
});
