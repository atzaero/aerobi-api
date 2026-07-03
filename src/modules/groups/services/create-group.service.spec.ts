import { AuditAction, Uf, UserRole } from '@/generated/prisma/client';
import type { AuditRecorderService } from '@/modules/audit/services/audit-recorder.service';
import type { RecordAuditContext } from '@/modules/audit/services/audit-recorder.service';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import type { StorageService } from '@/modules/storage/services/storage.service';

import type { CreateGroupDTO } from '../dtos/create-group.dto';
import { buildGroupCreateInput } from '../mappers/group.prisma.mapper';
import type { GroupRepository } from '../repositories/group.repository';
import { buildGroupFixture } from '../testing/group.entity.fixture';

import { CreateGroupService } from './create-group.service';

const storage = {
  getPresignedUrl: jest.fn(),
} as unknown as StorageService;

const actor: AuthenticatedUser = {
  id: 'actor-1',
  email: 'admin@e',
  role: UserRole.ADMIN,
};

const auditContext: RecordAuditContext = {
  actorId: actor.id,
  actorEmail: actor.email,
  actorRole: actor.role,
  ipAddress: '1.2.3.4',
  userAgent: 'jest',
};

describe('CreateGroupService', () => {
  let service: CreateGroupService;
  let create: jest.Mock;
  let record: jest.Mock;

  beforeEach(() => {
    create = jest.fn();
    record = jest.fn();
    const repo = { create } as unknown as GroupRepository;
    service = new CreateGroupService(repo, storage, {
      record,
    } as unknown as AuditRecorderService);
  });

  it('persiste com createdBy = ator autenticado', async () => {
    const dto: CreateGroupDTO = {
      uf: Uf.RJ,
      name: 'Sul',
    };
    const saved = buildGroupFixture({
      uf: Uf.RJ,
      name: 'Sul',
      createdBy: actor.id,
    });
    create.mockResolvedValue(saved);

    const out = await service.execute(dto, actor, auditContext);

    expect(create).toHaveBeenCalledWith(buildGroupCreateInput(dto, actor.id));
    expect(out.name).toBe('Sul');
    expect(out.uf).toBe(Uf.RJ);
    expect(out.createdBy).toBe(actor.id);
  });

  it('grava auditoria CREATE com snapshot after e contexto', async () => {
    const dto: CreateGroupDTO = { uf: Uf.RJ, name: 'Sul' };
    const saved = buildGroupFixture({ id: 'g-1', uf: Uf.RJ, name: 'Sul' });
    create.mockResolvedValue(saved);

    await service.execute(dto, actor, auditContext);

    expect(record).toHaveBeenCalledWith(
      {
        action: AuditAction.CREATE,
        entityType: 'group',
        entityId: 'g-1',
        after: { id: 'g-1', name: 'Sul', uf: Uf.RJ },
      },
      auditContext,
    );
  });
});
