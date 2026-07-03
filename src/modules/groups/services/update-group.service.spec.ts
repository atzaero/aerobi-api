import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { AuditAction, UserRole } from '@/generated/prisma/client';
import type { AuditRecorderService } from '@/modules/audit/services/audit-recorder.service';
import type { RecordAuditContext } from '@/modules/audit/services/audit-recorder.service';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import type { StorageService } from '@/modules/storage/services/storage.service';

import { patchGroupToPrisma } from '../mappers/group.prisma.mapper';
import type { GroupRepository } from '../repositories/group.repository';
import { buildGroupFixture } from '../testing/group.entity.fixture';

import { UpdateGroupService } from './update-group.service';

const actor: AuthenticatedUser = {
  id: 'actor-1',
  email: 'admin@e',
  role: UserRole.ADMIN,
};

const auditContext: RecordAuditContext = {
  actorId: actor.id,
  actorEmail: actor.email,
  actorRole: actor.role,
};

const storage = {
  getPresignedUrl: jest.fn(),
} as unknown as StorageService;

describe('UpdateGroupService', () => {
  let service: UpdateGroupService;
  let findById: jest.Mock;
  let update: jest.Mock;
  let record: jest.Mock;

  beforeEach(() => {
    findById = jest.fn();
    update = jest.fn();
    record = jest.fn();
    const repo = { findById, update } as unknown as GroupRepository;
    service = new UpdateGroupService(repo, storage, new ErrorMessageService(), {
      record,
    } as unknown as AuditRecorderService);
  });

  const id = '11111111-1111-4111-8111-111111111111';

  it('404 sem registo (não grava auditoria)', async () => {
    findById.mockResolvedValue(null);
    try {
      await service.execute(id, { name: 'X' }, actor, auditContext);
      throw new Error('expected');
    } catch (e) {
      expect(e).toBeInstanceOf(CustomHttpException);
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
    expect(update).not.toHaveBeenCalled();
    expect(record).not.toHaveBeenCalled();
  });

  it('edita só name e grava updatedBy = ator', async () => {
    findById.mockResolvedValue(buildGroupFixture({ id }));
    const updated = buildGroupFixture({
      id,
      name: 'Novo nome',
      updatedBy: actor.id,
    });
    update.mockResolvedValue(updated);
    await service.execute(id, { name: 'Novo nome' }, actor, auditContext);
    expect(update).toHaveBeenCalledWith(
      id,
      patchGroupToPrisma({ name: 'Novo nome' }, actor.id),
    );
  });

  it('grava auditoria UPDATE com before/after', async () => {
    const before = buildGroupFixture({ id, name: 'Antigo' });
    const after = buildGroupFixture({ id, name: 'Novo nome' });
    findById.mockResolvedValue(before);
    update.mockResolvedValue(after);

    await service.execute(id, { name: 'Novo nome' }, actor, auditContext);

    expect(record).toHaveBeenCalledWith(
      {
        action: AuditAction.UPDATE,
        entityType: 'group',
        entityId: id,
        before: { id, name: 'Antigo', uf: before.uf },
        after: { id, name: 'Novo nome', uf: after.uf },
      },
      auditContext,
    );
  });
});
