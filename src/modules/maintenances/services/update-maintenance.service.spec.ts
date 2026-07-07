import { EventEmitter2 } from '@nestjs/event-emitter';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { AuditAction, UserRole } from '@/generated/prisma/client';
import type { Prisma } from '@/generated/prisma/client';
import { AuditRecorderService } from '@/modules/audit/services/audit-recorder.service';
import type {
  RecordAuditContext,
  RecordAuditInput,
} from '@/modules/audit/services/audit-recorder.service';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { MAINTENANCE_INVITED_EVENT } from '../events/maintenance-invited.event';
import { MaintenanceRepository } from '../repositories/maintenance.repository';

import { UpdateMaintenanceService } from './update-maintenance.service';

describe('UpdateMaintenanceService', () => {
  const actor: AuthenticatedUser = {
    id: 'actor-1',
    email: 'coord@test.com',
    role: UserRole.COORDINATOR,
  };

  /** Regex do código gerado por `generateSecurityCode` (maiúsculas + 2-9). */
  const SECURITY_CODE_RE = /^[A-Z2-9]{8}$/;

  let service: UpdateMaintenanceService;
  let findById: jest.Mock;
  let update: jest.Mock;
  let auditRecord: jest.Mock;
  let emit: jest.Mock;

  /** Monta um `MaintenanceWithAerodrome` mínimo para o `findById`. */
  const existingMaintenance = (over: {
    securityCode: string | null;
    authorizedEmails: string[];
  }) => ({
    id: 'm1',
    name: 'Plano',
    aerodromeId: 'a1',
    securityCode: over.securityCode,
    authorizedEmails: over.authorizedEmails,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    aerodrome: { group: { uf: 'PI' } },
  });

  beforeEach(() => {
    findById = jest.fn();
    update = jest.fn();
    auditRecord = jest.fn();
    emit = jest.fn();

    service = new UpdateMaintenanceService(
      { findById, update } as unknown as MaintenanceRepository,
      {
        getMessage: jest.fn((code: string) => code),
      } as unknown as ErrorMessageService,
      { record: auditRecord } as unknown as AuditRecorderService,
      { emit } as unknown as EventEmitter2,
    );
  });

  it('lança 404 quando a intervenção não existe', async () => {
    findById.mockResolvedValue(null);

    await expect(
      service.execute('missing', { name: 'X' }, actor),
    ).rejects.toMatchObject({ status: 404 });
    expect(update).not.toHaveBeenCalled();
  });

  it('preserva o código e não reenvia quando nada muda', async () => {
    findById.mockResolvedValue(
      existingMaintenance({
        securityCode: 'OLDCODE1',
        authorizedEmails: ['a@x.com'],
      }),
    );
    update.mockResolvedValue({
      id: 'm1',
      aerodromeId: 'a1',
      name: 'Plano',
      securityCode: 'OLDCODE1',
      authorizedEmails: ['a@x.com'],
    });

    const result = await service.execute(
      'm1',
      { name: 'Plano', authorizedEmails: ['a@x.com'] },
      actor,
    );

    expect(update).toHaveBeenCalledWith(
      'm1',
      expect.objectContaining({
        securityCode: 'OLDCODE1',
        authorizedEmails: ['a@x.com'],
        updatedBy: actor.id,
      }),
    );
    expect(emit).not.toHaveBeenCalled();
    expect(result).toEqual({ id: 'm1', securityCode: 'OLDCODE1' });

    const [auditInput] = auditRecord.mock.calls[0] as [RecordAuditInput];
    expect(auditInput.action).toBe(AuditAction.UPDATE);
    expect(auditInput.metadata?.securityCodeRegenerated).toBe(false);
  });

  it('reenvia apenas aos e-mails adicionados (diff) quando o código é preservado', async () => {
    findById.mockResolvedValue(
      existingMaintenance({
        securityCode: 'OLDCODE1',
        authorizedEmails: ['a@x.com'],
      }),
    );
    update.mockResolvedValue({
      id: 'm1',
      aerodromeId: 'a1',
      name: 'Plano',
      securityCode: 'OLDCODE1',
      authorizedEmails: ['a@x.com', 'b@x.com'],
    });

    await service.execute(
      'm1',
      { name: 'Plano', authorizedEmails: ['a@x.com', 'b@x.com'] },
      actor,
    );

    expect(emit).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenCalledWith(
      MAINTENANCE_INVITED_EVENT,
      expect.objectContaining({
        maintenanceId: 'm1',
        aerodromeId: 'a1',
        emails: ['b@x.com'],
        securityCode: 'OLDCODE1',
      }),
    );
  });

  it('regenera o código e reenvia a todos quando regenerateSecurityCode=true', async () => {
    findById.mockResolvedValue(
      existingMaintenance({
        securityCode: 'OLDCODE1',
        authorizedEmails: ['a@x.com', 'b@x.com'],
      }),
    );
    update.mockResolvedValue({
      id: 'm1',
      aerodromeId: 'a1',
      name: 'Plano',
      securityCode: 'NEWCODE2',
      authorizedEmails: ['a@x.com', 'b@x.com'],
    });

    await service.execute(
      'm1',
      {
        name: 'Plano',
        authorizedEmails: ['a@x.com', 'b@x.com'],
        regenerateSecurityCode: true,
      },
      actor,
    );

    const [, updateInput] = update.mock.calls[0] as [
      string,
      Prisma.MaintenanceUpdateInput,
    ];
    expect(updateInput.securityCode).toMatch(SECURITY_CODE_RE);
    expect(updateInput.securityCode).not.toBe('OLDCODE1');

    expect(emit).toHaveBeenCalledWith(
      MAINTENANCE_INVITED_EVENT,
      expect.objectContaining({
        emails: ['a@x.com', 'b@x.com'],
        securityCode: 'NEWCODE2',
      }),
    );

    const [auditInput] = auditRecord.mock.calls[0] as [RecordAuditInput];
    expect(auditInput.metadata?.securityCodeRegenerated).toBe(true);
  });

  it('regenera o código quando o legado estava vazio e reenvia a todos', async () => {
    findById.mockResolvedValue(
      existingMaintenance({
        securityCode: '',
        authorizedEmails: ['a@x.com'],
      }),
    );
    update.mockResolvedValue({
      id: 'm1',
      aerodromeId: 'a1',
      name: 'Plano',
      securityCode: 'FRESHCD3',
      authorizedEmails: ['a@x.com'],
    });

    await service.execute(
      'm1',
      { name: 'Plano', authorizedEmails: ['a@x.com'] },
      actor,
    );

    const [, updateInput] = update.mock.calls[0] as [
      string,
      Prisma.MaintenanceUpdateInput,
    ];
    expect(updateInput.securityCode).toMatch(SECURITY_CODE_RE);

    expect(emit).toHaveBeenCalledWith(
      MAINTENANCE_INVITED_EVENT,
      expect.objectContaining({
        emails: ['a@x.com'],
        securityCode: 'FRESHCD3',
      }),
    );
  });

  it('zera o código e não reenvia quando os e-mails ficam vazios', async () => {
    findById.mockResolvedValue(
      existingMaintenance({
        securityCode: 'OLDCODE1',
        authorizedEmails: ['a@x.com'],
      }),
    );
    update.mockResolvedValue({
      id: 'm1',
      aerodromeId: 'a1',
      name: 'Plano',
      securityCode: null,
      authorizedEmails: [],
    });

    const result = await service.execute('m1', { name: 'Plano' }, actor);

    expect(update).toHaveBeenCalledWith(
      'm1',
      expect.objectContaining({ securityCode: null, authorizedEmails: [] }),
    );
    expect(emit).not.toHaveBeenCalled();
    expect(result).toEqual({ id: 'm1', securityCode: null });
  });

  it('grava auditoria UPDATE com snapshots sem segredos e propaga o contexto', async () => {
    findById.mockResolvedValue(
      existingMaintenance({
        securityCode: 'OLDCODE1',
        authorizedEmails: ['a@x.com', 'b@x.com'],
      }),
    );
    update.mockResolvedValue({
      id: 'm1',
      aerodromeId: 'a1',
      name: 'Plano',
      securityCode: 'OLDCODE1',
      authorizedEmails: ['a@x.com', 'b@x.com'],
    });

    const auditContext = { actorId: 'actor-1', ipAddress: '10.0.0.1' };
    await service.execute(
      'm1',
      { name: 'Plano', authorizedEmails: ['a@x.com', 'b@x.com'] },
      actor,
      auditContext,
    );

    const [auditInput, ctx] = auditRecord.mock.calls[0] as [
      RecordAuditInput,
      RecordAuditContext,
    ];
    expect(ctx).toBe(auditContext);
    expect(auditInput.entityType).toBe('maintenance');
    expect(auditInput.entityId).toBe('m1');
    expect(auditInput.metadata?.uf).toBe('PI');
    expect(auditInput.before).toEqual({
      id: 'm1',
      name: 'Plano',
      aerodromeId: 'a1',
      authorizedEmailsCount: 2,
    });
    expect(auditInput.before).not.toHaveProperty('securityCode');
    expect(auditInput.after).not.toHaveProperty('authorizedEmails');
  });
});
