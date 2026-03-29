import { ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

import { FirebaseOrApiKeyGuard } from './firebase-or-api-key.guard';
import { FirebaseAdminService } from '@/modules/auth/services/firebase-admin.service';

function createContext(
  headers: Record<string, string | undefined>,
): ExecutionContext {
  const req = { headers } as Request;
  return {
    switchToHttp: () => ({
      getRequest: () => req,
    }),
  } as ExecutionContext;
}

describe('FirebaseOrApiKeyGuard', () => {
  let guard: FirebaseOrApiKeyGuard;
  let configGet: jest.Mock;
  let firebase: {
    isEnabled: jest.Mock;
    verifyIdToken: jest.Mock;
  };

  beforeEach(() => {
    configGet = jest.fn();
    firebase = {
      isEnabled: jest.fn(),
      verifyIdToken: jest.fn(),
    };
    guard = new FirebaseOrApiKeyGuard(
      { get: configGet } as unknown as ConfigService,
      firebase as unknown as FirebaseAdminService,
    );
  });

  function mockConfig(map: Record<string, string | undefined>) {
    configGet.mockImplementation((key: string, defaultVal?: string) => {
      if (key in map) return map[key];
      return defaultVal;
    });
  }

  it('bypass: NODE_ENV=development e sem RAB_SYNC_REQUIRE_AUTH → true', async () => {
    mockConfig({ NODE_ENV: 'development' });
    const ctx = createContext({});
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(firebase.verifyIdToken).not.toHaveBeenCalled();
  });

  it('bypass: NODE_ENV omitido usa default development → true', async () => {
    mockConfig({});
    configGet.mockImplementation((key: string, defaultVal?: string) => {
      if (key === 'NODE_ENV') return defaultVal;
      if (key === 'RAB_SYNC_REQUIRE_AUTH') return '';
      return defaultVal;
    });
    const ctx = createContext({});
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  it('RAB_SYNC_REQUIRE_AUTH=true em development não faz bypass → falta auth', async () => {
    mockConfig({
      NODE_ENV: 'development',
      RAB_SYNC_REQUIRE_AUTH: 'true',
      RAB_SYNC_API_KEY: '',
    });
    const ctx = createContext({});
    await expect(guard.canActivate(ctx)).rejects.toMatchObject({
      response: { message: 'Missing or invalid Authorization' },
    });
  });

  it('RAB_SYNC_REQUIRE_AUTH=1 e yes tratados como enforced', async () => {
    mockConfig({
      NODE_ENV: 'development',
      RAB_SYNC_REQUIRE_AUTH: '1',
      RAB_SYNC_API_KEY: '',
    });
    await expect(guard.canActivate(createContext({}))).rejects.toMatchObject({
      response: { message: 'Missing or invalid Authorization' },
    });

    mockConfig({
      NODE_ENV: 'development',
      RAB_SYNC_REQUIRE_AUTH: 'yes',
      RAB_SYNC_API_KEY: '',
    });
    await expect(guard.canActivate(createContext({}))).rejects.toMatchObject({
      response: { message: 'Missing or invalid Authorization' },
    });
  });

  it('produção: RAB_SYNC_API_KEY coincide com x-api-key → true', async () => {
    mockConfig({
      NODE_ENV: 'production',
      RAB_SYNC_API_KEY: 'secret-key',
    });
    const ctx = createContext({ 'x-api-key': 'secret-key' });
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(firebase.verifyIdToken).not.toHaveBeenCalled();
  });

  it('produção: API key errada e sem Bearer → 401', async () => {
    mockConfig({
      NODE_ENV: 'production',
      RAB_SYNC_API_KEY: 'expected',
    });
    const ctx = createContext({ 'x-api-key': 'wrong' });
    await expect(guard.canActivate(ctx)).rejects.toMatchObject({
      response: { message: 'Missing or invalid Authorization' },
    });
  });

  it('produção: Bearer válido e Firebase ativo → true e req.user', async () => {
    mockConfig({
      NODE_ENV: 'production',
      RAB_SYNC_API_KEY: '',
    });
    const decoded = { uid: 'abc' };
    firebase.isEnabled.mockReturnValue(true);
    firebase.verifyIdToken.mockResolvedValue(decoded);
    const ctx = createContext({
      authorization: 'Bearer good.token',
    });
    const req = ctx.switchToHttp().getRequest<Request & { user?: unknown }>();
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(firebase.verifyIdToken).toHaveBeenCalledWith('good.token');
    expect(req.user).toBe(decoded);
  });

  it('Bearer presente mas Firebase desativado → 401', async () => {
    mockConfig({ NODE_ENV: 'production', RAB_SYNC_API_KEY: '' });
    firebase.isEnabled.mockReturnValue(false);
    const ctx = createContext({ authorization: 'Bearer x' });
    await expect(guard.canActivate(ctx)).rejects.toMatchObject({
      response: {
        message:
          'Firebase Admin not configured; set FIREBASE_PROJECT_ID or use X-API-Key when RAB_SYNC_API_KEY is set',
      },
    });
  });

  it('verifyIdToken falha → Invalid Firebase ID token', async () => {
    mockConfig({ NODE_ENV: 'production', RAB_SYNC_API_KEY: '' });
    firebase.isEnabled.mockReturnValue(true);
    firebase.verifyIdToken.mockRejectedValue(new Error('bad token'));
    const ctx = createContext({ authorization: 'Bearer bad' });
    await expect(guard.canActivate(ctx)).rejects.toMatchObject({
      response: { message: 'Invalid Firebase ID token' },
    });
  });
});
