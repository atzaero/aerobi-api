import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

import { AerobiApiKeyGuard } from './aerobi-api-key.guard';

function mockContext(
  headers: Record<string, string | undefined>,
): ExecutionContext {
  const req = { headers } as unknown as Request;
  return {
    switchToHttp: () => ({
      getRequest: () => req,
    }),
  } as ExecutionContext;
}

function mockConfig(values: Record<string, string | undefined>): ConfigService {
  return {
    get: (key: string, defaultValue?: string) =>
      (values[key] !== undefined ? values[key] : defaultValue) as string,
  } as ConfigService;
}

describe('AerobiApiKeyGuard', () => {
  const secret = 'a'.repeat(32);

  it('development without AEROBI_REQUIRE_AUTH bypasses without header', () => {
    const guard = new AerobiApiKeyGuard(
      mockConfig({
        NODE_ENV: 'development',
        AEROBI_REQUIRE_AUTH: '',
        AEROBI_API_KEY: secret,
      }),
    );
    expect(guard.canActivate(mockContext({}))).toBe(true);
  });

  it('development with AEROBI_REQUIRE_AUTH=true requires valid X-API-Key', () => {
    const guard = new AerobiApiKeyGuard(
      mockConfig({
        NODE_ENV: 'development',
        AEROBI_REQUIRE_AUTH: 'true',
        AEROBI_API_KEY: secret,
      }),
    );
    expect(() => guard.canActivate(mockContext({}))).toThrow(
      UnauthorizedException,
    );
    expect(guard.canActivate(mockContext({ 'x-api-key': secret }))).toBe(true);
  });

  it('production requires AEROBI_API_KEY to be set', () => {
    const guard = new AerobiApiKeyGuard(
      mockConfig({
        NODE_ENV: 'production',
        AEROBI_API_KEY: '',
      }),
    );
    expect(() => guard.canActivate(mockContext({}))).toThrow(
      UnauthorizedException,
    );
  });

  it('production accepts matching X-API-Key', () => {
    const guard = new AerobiApiKeyGuard(
      mockConfig({
        NODE_ENV: 'production',
        AEROBI_API_KEY: secret,
      }),
    );
    expect(guard.canActivate(mockContext({ 'x-api-key': secret }))).toBe(true);
  });

  it('production rejects wrong key', () => {
    const guard = new AerobiApiKeyGuard(
      mockConfig({
        NODE_ENV: 'production',
        AEROBI_API_KEY: secret,
      }),
    );
    expect(() =>
      guard.canActivate(mockContext({ 'x-api-key': 'wrong' })),
    ).toThrow(UnauthorizedException);
  });

  it('rejects when key lengths differ (timing-safe path)', () => {
    const guard = new AerobiApiKeyGuard(
      mockConfig({
        NODE_ENV: 'production',
        AEROBI_API_KEY: secret,
      }),
    );
    expect(() =>
      guard.canActivate(mockContext({ 'x-api-key': secret + 'x' })),
    ).toThrow(UnauthorizedException);
  });
});
