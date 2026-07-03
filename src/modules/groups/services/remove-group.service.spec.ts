import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { AuditAction, UserRole } from '@/generated/prisma/client';
import type { AuditRecorderService } from '@/modules/audit/services/audit-recorder.service';
import type { RecordAuditContext } from '@/modules/audit/services/audit-recorder.service';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import type { StorageService } from '@/modules/storage/services/storage.service';

import type { GroupRepository } from '../repositories/group.repository';
import { buildGroupFixture } from '../testing/group.entity.fixture';

import { RemoveGroupService } from './remove-group.service';

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

describe('RemoveGroupService', () => {
  let service: RemoveGroupService;
  let findById: jest.Mock;
  let softDeleteWithCascade: jest.Mock;
  let record: jest.Mock;

  beforeEach(() => {
    findById = jest.fn();
    softDeleteWithCascade = jest.fn();
    record = jest.fn();
    const repo = {
      findById,
      softDeleteWithCascade,
    } as unknown as GroupRepository;
    service = new RemoveGroupService(repo, storage, new ErrorMessageService(), {
      record,
    } as unknown as AuditRecorderService);
  });

  const id = '11111111-1111-4111-8111-111111111111';

  it('404 (não deleta nem grava auditoria)', async () => {
    findById.mockResolvedValue(null);
    try {
      await service.execute(id, actor, auditContext);
      throw new Error('expected');
    } catch (e) {
      expect(e).toBeInstanceOf(CustomHttpException);
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
    expect(softDeleteWithCascade).not.toHaveBeenCalled();
    expect(record).not.toHaveBeenCalled();
  });

  it('cascata: deletedBy = ator e devolve affectedAerodromes', async () => {
    findById.mockResolvedValue(buildGroupFixture({ id }));
    const group = buildGroupFixture({
      id,
      deletedBy: actor.id,
      deletedAt: new Date('2025-01-01T00:00:00.000Z'),
    });
    softDeleteWithCascade.mockResolvedValue({ group, affectedAerodromes: 2 });

    const out = await service.execute(id, actor, auditContext);

    expect(softDeleteWithCascade).toHaveBeenCalledWith(id, actor.id);
    expect(out.id).toBe(id);
    expect(out.affectedAerodromes).toBe(2);
  });

  it('grava auditoria DELETE com before e metadata.affectedAerodromes', async () => {
    const before = buildGroupFixture({ id, name: 'Grupo' });
    findById.mockResolvedValue(before);
    softDeleteWithCascade.mockResolvedValue({
      group: buildGroupFixture({ id }),
      affectedAerodromes: 3,
    });

    await service.execute(id, actor, auditContext);

    expect(record).toHaveBeenCalledWith(
      {
        action: AuditAction.DELETE,
        entityType: 'group',
        entityId: id,
        before: { id, name: 'Grupo', uf: before.uf },
        metadata: { affectedAerodromes: 3 },
      },
      auditContext,
    );
  });
});
