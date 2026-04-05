import { HttpService } from '@nestjs/axios';
import {
  BadGatewayException,
  HttpException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { of, throwError } from 'rxjs';

import { PlugfieldHttpService } from './plugfield-http.service';

describe('PlugfieldHttpService', () => {
  let service: PlugfieldHttpService;
  let httpRequest: jest.Mock;

  beforeEach(() => {
    httpRequest = jest.fn();
    const http = { request: httpRequest } as unknown as HttpService;
    const config = {
      get: jest.fn((key: string, def?: unknown) => {
        if (key === 'PLUGFIELD_VENDOR_API_KEY') {
          return 'vendor-key';
        }
        if (key === 'PLUGFIELD_API_BASE_URL') {
          return 'https://prod-api.plugfield.com.br';
        }
        if (key === 'PLUGFIELD_VENDOR_AUTHORIZATION') {
          return '';
        }
        return def;
      }),
    } as unknown as ConfigService;
    service = new PlugfieldHttpService(http, config);
  });

  it('returns parsed JSON on 200', async () => {
    httpRequest.mockReturnValue(of({ status: 200, data: { ok: true } }));

    const actual = await service.requestJson({
      method: 'GET',
      path: '/device',
      useVendorAuthorization: true,
    });

    expect(actual).toEqual({ ok: true });
    expect(httpRequest).toHaveBeenCalledTimes(1);
    const firstCall = httpRequest.mock.calls as unknown as Array<
      [
        {
          method: string;
          url: string;
          headers: Record<string, string | undefined>;
        },
      ]
    >;
    const req = firstCall[0][0];
    expect(req.method).toBe('GET');
    expect(req.url).toBe('https://prod-api.plugfield.com.br/device');
    expect(req.headers['x-api-key']).toBe('vendor-key');
    expect(req.headers['Content-Type']).toBe('application/json');
  });

  it('does not send Authorization when useVendorAuthorization is false', async () => {
    httpRequest.mockReturnValue(of({ status: 200, data: {} }));

    await service.requestJson({
      method: 'POST',
      path: '/login',
      body: { username: 'u', password: 'p' },
      useVendorAuthorization: false,
    });

    const calls = httpRequest.mock.calls as unknown as Array<
      [{ headers: Record<string, string | undefined> }]
    >;
    const call = calls[0][0];
    expect(call.headers['Authorization']).toBeUndefined();
  });

  it('forwards incoming Authorization when useVendorAuthorization is true', async () => {
    httpRequest.mockReturnValue(of({ status: 200, data: {} }));

    await service.requestJson({
      method: 'GET',
      path: '/device',
      useVendorAuthorization: true,
      incomingAuthorization: 'Bearer token-1',
    });

    const calls = httpRequest.mock.calls as unknown as Array<
      [{ headers: Record<string, string | undefined> }]
    >;
    const call = calls[0][0];
    expect(call.headers['Authorization']).toBe('Bearer token-1');
  });

  it('throws ServiceUnavailableException when vendor API key is missing', async () => {
    const config = {
      get: jest.fn((key: string, def?: unknown) => {
        if (key === 'PLUGFIELD_VENDOR_API_KEY') {
          return '  ';
        }
        if (key === 'PLUGFIELD_API_BASE_URL') {
          return 'https://prod-api.plugfield.com.br';
        }
        return def;
      }),
    } as unknown as ConfigService;
    const http = { request: httpRequest } as unknown as HttpService;
    const svc = new PlugfieldHttpService(http, config);

    await expect(
      svc.requestJson({
        method: 'GET',
        path: '/device',
        useVendorAuthorization: true,
      }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('throws HttpException on Plugfield 4xx', async () => {
    httpRequest.mockReturnValue(
      of({ status: 404, data: { message: 'not found' } }),
    );

    await expect(
      service.requestJson({
        method: 'GET',
        path: '/device/x',
        useVendorAuthorization: true,
      }),
    ).rejects.toBeInstanceOf(HttpException);
  });

  it('throws BadGatewayException on Plugfield 5xx', async () => {
    httpRequest.mockReturnValue(of({ status: 502, data: {} }));

    await expect(
      service.requestJson({
        method: 'GET',
        path: '/device',
        useVendorAuthorization: true,
      }),
    ).rejects.toBeInstanceOf(BadGatewayException);
  });

  it('throws BadGatewayException on axios network error', async () => {
    httpRequest.mockReturnValue(throwError(() => new AxiosError('network')));

    await expect(
      service.requestJson({
        method: 'GET',
        path: '/device',
        useVendorAuthorization: true,
      }),
    ).rejects.toBeInstanceOf(BadGatewayException);
  });
});
