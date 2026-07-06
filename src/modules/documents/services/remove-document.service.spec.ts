import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { AuditAction, UserRole } from '@/generated/prisma/client';
import type { AuditRecorderService } from '@/modules/audit/services/audit-recorder.service';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import type { StorageService } from '@/modules/storage/services/storage.service';

import type { DocumentRepository } from '../repositories/document.repository';
import { buildDocumentFixture } from '../testing/document.entity.fixture';

import { RemoveDocumentService } from './remove-document.service';

const actor: AuthenticatedUser = {
  id: 'admin-1',
  email: 'a@a.com',
  role: UserRole.ADMIN,
};
const id = '11111111-1111-4111-8111-111111111111';

describe('RemoveDocumentService', () => {
  let service: RemoveDocumentService;
  let findById: jest.Mock;
  let softDelete: jest.Mock;
  let record: jest.Mock;

  beforeEach(() => {
    findById = jest.fn().mockResolvedValue(buildDocumentFixture({ id }));
    softDelete = jest.fn().mockResolvedValue(buildDocumentFixture({ id }));
    record = jest.fn().mockResolvedValue(undefined);
    service = new RemoveDocumentService(
      { findById, softDelete } as unknown as DocumentRepository,
      {
        getPresignedUrl: jest.fn().mockResolvedValue(null),
      } as unknown as StorageService,
      new ErrorMessageService(),
      { record } as unknown as AuditRecorderService,
    );
  });

  it('soft-delete com ator real + audita DELETE', async () => {
    await service.execute(id, actor);
    expect(softDelete).toHaveBeenCalledWith(id, actor.id);
    expect(record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: AuditAction.DELETE,
        entityType: 'document',
      }),
      expect.anything(),
    );
  });

  it('inexistente → 404, não remove', async () => {
    findById.mockResolvedValue(null);
    await expect(service.execute(id, actor)).rejects.toBeInstanceOf(
      CustomHttpException,
    );
    expect(softDelete).not.toHaveBeenCalled();
  });
});
