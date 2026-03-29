import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

import { FirebaseAdminService } from './firebase-admin.service';

jest.mock('firebase-admin', () => {
  const apps: unknown[] = [];
  const verifyIdToken = jest.fn();
  const authReturn = { verifyIdToken };
  return {
    apps,
    initializeApp: jest.fn(() => {
      apps.push({ name: '[DEFAULT]' });
    }),
    credential: {
      cert: jest.fn(() => ({ type: 'cert' })),
      applicationDefault: jest.fn(() => ({ type: 'adc' })),
    },
    auth: jest.fn(() => authReturn),
  };
});

function getVerifyIdTokenMock(): jest.Mock {
  return (admin.auth() as unknown as { verifyIdToken: jest.Mock })
    .verifyIdToken;
}

describe('FirebaseAdminService', () => {
  let service: FirebaseAdminService;
  let configGet: jest.Mock;

  beforeEach(() => {
    (admin.apps as unknown[]).length = 0;
    jest.clearAllMocks();
    configGet = jest.fn();
  });

  async function createService() {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FirebaseAdminService,
        { provide: ConfigService, useValue: { get: configGet } },
      ],
    }).compile();
    service = module.get(FirebaseAdminService);
  }

  it('onModuleInit: sem FIREBASE_PROJECT_ID não inicializa e isEnabled é false', async () => {
    // Arrange
    configGet.mockReturnValue(undefined);
    await createService();

    // Act
    service.onModuleInit();

    // Assert
    expect(admin.initializeApp).not.toHaveBeenCalled();
    expect(service.isEnabled()).toBe(false);
  });

  it('onModuleInit: com projectId e FIREBASE_SERVICE_ACCOUNT_JSON usa cert', async () => {
    // Arrange
    const sa = { type: 'service_account', project_id: 'p1' };
    configGet.mockImplementation((key: string) => {
      if (key === 'FIREBASE_PROJECT_ID') return 'p1';
      if (key === 'FIREBASE_SERVICE_ACCOUNT_JSON') return JSON.stringify(sa);
      return undefined;
    });
    await createService();

    // Act
    service.onModuleInit();

    // Assert
    expect(admin.credential.cert).toHaveBeenCalledWith(sa);
    expect(admin.initializeApp).toHaveBeenCalledWith({
      credential: { type: 'cert' },
      projectId: 'p1',
    });
    expect(service.isEnabled()).toBe(true);
  });

  it('onModuleInit: com projectId sem JSON usa applicationDefault', async () => {
    // Arrange
    configGet.mockImplementation((key: string) => {
      if (key === 'FIREBASE_PROJECT_ID') return 'p2';
      if (key === 'FIREBASE_SERVICE_ACCOUNT_JSON') return undefined;
      return undefined;
    });
    await createService();

    // Act
    service.onModuleInit();

    // Assert
    expect(admin.credential.applicationDefault).toHaveBeenCalled();
    expect(admin.initializeApp).toHaveBeenCalledWith({
      credential: { type: 'adc' },
      projectId: 'p2',
    });
    expect(service.isEnabled()).toBe(true);
  });

  it('onModuleInit: se admin.apps já tiver entrada, não chama initializeApp', async () => {
    // Arrange
    (admin.apps as unknown[]).push({ name: '[DEFAULT]' });
    configGet.mockImplementation((key: string) => {
      if (key === 'FIREBASE_PROJECT_ID') return 'p3';
      return undefined;
    });
    await createService();

    // Act
    service.onModuleInit();

    // Assert
    expect(admin.initializeApp).not.toHaveBeenCalled();
  });

  it('onModuleInit: JSON inválido chama logger.error', async () => {
    // Arrange
    const errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    configGet.mockImplementation((key: string) => {
      if (key === 'FIREBASE_PROJECT_ID') return 'p4';
      if (key === 'FIREBASE_SERVICE_ACCOUNT_JSON') return 'not-json{{{';
      return undefined;
    });
    await createService();

    // Act
    service.onModuleInit();

    // Assert
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('onModuleInit: initializeApp a lançar chama logger.error', async () => {
    // Arrange
    const errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    configGet.mockImplementation((key: string) => {
      if (key === 'FIREBASE_PROJECT_ID') return 'p5';
      return undefined;
    });
    (admin.initializeApp as jest.Mock).mockImplementationOnce(() => {
      throw new Error('init fail');
    });
    await createService();

    // Act
    service.onModuleInit();

    // Assert
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('verifyIdToken delega para admin.auth().verifyIdToken', async () => {
    // Arrange
    configGet.mockImplementation((key: string) => {
      if (key === 'FIREBASE_PROJECT_ID') return 'p';
      return undefined;
    });
    await createService();
    service.onModuleInit();
    const vt = getVerifyIdTokenMock();
    vt.mockResolvedValue({ uid: 'u1' });

    // Act
    const result = await service.verifyIdToken('t1');

    // Assert
    expect(result).toEqual({ uid: 'u1' });
    expect(vt).toHaveBeenCalledWith('t1');
  });
});
