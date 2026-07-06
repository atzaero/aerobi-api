import { EventEmitter2 } from '@nestjs/event-emitter';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { UserRole } from '@/generated/prisma/client';
import { AuditRecorderService } from '@/modules/audit/services/audit-recorder.service';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { UserRepository } from '@/modules/users/repositories/user.repository';

import { CreateMaintenanceDTO } from '../dtos/create-maintenance.dto';
import { MaintenanceRepository } from '../repositories/maintenance.repository';

import { CreateMaintenanceService } from './create-maintenance.service';

describe('CreateMaintenanceService', () => {
  const actor: AuthenticatedUser = {
    id: 'actor-1',
    email: 'coord@test.com',
    role: UserRole.COORDINATOR,
  };

  let service: CreateMaintenanceService;
  let create: jest.Mock;
  let findActiveAerodrome: jest.Mock;
  let findActiveById: jest.Mock;
  let auditRecord: jest.Mock;
  let emit: jest.Mock;

  beforeEach(() => {
    create = jest.fn();
    findActiveAerodrome = jest.fn();
    findActiveById = jest.fn();
    auditRecord = jest.fn();
    emit = jest.fn();

    service = new CreateMaintenanceService(
      { create, findActiveAerodrome } as unknown as MaintenanceRepository,
      { findActiveById } as unknown as UserRepository,
      {
        getMessage: jest.fn((code: string) => code),
      } as unknown as ErrorMessageService,
      { record: auditRecord } as unknown as AuditRecorderService,
      { emit } as unknown as EventEmitter2,
    );
  });

  it('cria intervenção com securityCode quando há e-mails autorizados', async () => {
    const dto: CreateMaintenanceDTO = {
      name: 'Plano A',
      aerodromeId: 'aero-1',
      authorizedEmails: ['A@test.com', 'a@test.com'],
    };

    findActiveById.mockResolvedValue({ groupId: 'group-1' });
    findActiveAerodrome.mockResolvedValue({
      id: 'aero-1',
      groupId: 'group-1',
      group: { uf: 'PI' },
    });
    create.mockResolvedValue({
      id: 'maint-1',
      aerodromeId: 'aero-1',
      securityCode: 'ABCD2345',
      authorizedEmails: ['A@test.com'],
      name: 'Plano A',
    });

    const result = await service.execute(dto, actor);

    expect(result).toEqual({
      id: 'maint-1',
      aerodromeId: 'aero-1',
      securityCode: 'ABCD2345',
    });
    expect(create).toHaveBeenCalled();
    expect(emit).toHaveBeenCalled();
    expect(auditRecord).toHaveBeenCalled();
  });

  it('rejeita aeródromo fora do escopo do coordinator', async () => {
    findActiveById.mockResolvedValue({ groupId: 'group-1' });
    findActiveAerodrome.mockResolvedValue({
      id: 'aero-1',
      groupId: 'other-group',
      group: { uf: 'PI' },
    });

    await expect(
      service.execute(
        { name: 'X', aerodromeId: 'aero-1', authorizedEmails: [] },
        actor,
      ),
    ).rejects.toMatchObject({ status: 404 });
  });
});
