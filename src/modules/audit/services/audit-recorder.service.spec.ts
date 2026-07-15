import { Logger } from '@nestjs/common';

import { AuditAction, UserRole } from '@/generated/prisma/client';

import type { AuditLogRepository } from '../repositories/audit-log.repository';

import { AuditRecorderService } from './audit-recorder.service';

describe('AuditRecorderService', () => {
  let create: jest.Mock;
  let service: AuditRecorderService;

  beforeEach(() => {
    create = jest.fn().mockResolvedValue({ id: 'a-1' });
    service = new AuditRecorderService({
      create,
    } as unknown as AuditLogRepository);
  });

  it('grava com ator e contexto completos', async () => {
    await service.record(
      {
        action: AuditAction.CREATE,
        entityType: 'group',
        entityId: 'g-1',
        after: { name: 'Grupo X' },
        metadata: { coordinatorCount: 2 },
      },
      {
        actorId: 'u-1',
        actorEmail: 'a@x',
        actorRole: UserRole.ADMIN,
        ipAddress: '1.1.1.1',
        userAgent: 'jest',
      },
    );

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        action: AuditAction.CREATE,
        entityType: 'group',
        entityId: 'g-1',
        after: { name: 'Grupo X' },
        metadata: { coordinatorCount: 2 },
        actorId: 'u-1',
        actorEmail: 'a@x',
        actorRole: UserRole.ADMIN,
        ipAddress: '1.1.1.1',
        userAgent: 'jest',
      }),
    );
  });

  it('sem contexto → actor/ip/ua nulos (ação pública/sistêmica)', async () => {
    await service.record({
      action: AuditAction.DELETE,
      entityType: 'user',
      entityId: 't-1',
    });

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: null,
        actorEmail: null,
        actorRole: null,
        ipAddress: null,
        userAgent: null,
      }),
    );
  });

  it('best-effort: falha do repositório é logada e NÃO propaga', async () => {
    create.mockRejectedValue(new Error('db down'));
    const loggerError = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);

    await expect(
      service.record({
        action: AuditAction.CREATE,
        entityType: 'user',
        entityId: 't-1',
      }),
    ).resolves.toBeUndefined();

    expect(loggerError).toHaveBeenCalled();
    loggerError.mockRestore();
  });
});
