import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { AuditAction, UserRole } from '@/generated/prisma/client';
import type { AuditRecorderService } from '@/modules/audit/services/audit-recorder.service';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import type { StorageService } from '@/modules/storage/services/storage.service';

import type { DocumentRepository } from '../repositories/document.repository';
import { buildDocumentFixture } from '../testing/document.entity.fixture';

import { UpdateDocumentService } from './update-document.service';

const actor: AuthenticatedUser = {
  id: 'coord-1',
  email: 'c@c.com',
  role: UserRole.COORDINATOR,
};
const id = '11111111-1111-4111-8111-111111111111';

describe('UpdateDocumentService', () => {
  let service: UpdateDocumentService;
  let findById: jest.Mock;
  let update: jest.Mock;
  let record: jest.Mock;

  beforeEach(() => {
    findById = jest.fn().mockResolvedValue(buildDocumentFixture({ id }));
    update = jest
      .fn()
      .mockResolvedValue(
        buildDocumentFixture({ id, originalFilename: 'novo.pdf' }),
      );
    record = jest.fn().mockResolvedValue(undefined);
    service = new UpdateDocumentService(
      { findById, update } as unknown as DocumentRepository,
      {
        getPresignedUrl: jest.fn().mockResolvedValue(null),
      } as unknown as StorageService,
      new ErrorMessageService(),
      { record } as unknown as AuditRecorderService,
    );
  });

  it('renomeia (só originalFilename) + audita UPDATE', async () => {
    const out = await service.execute(
      id,
      { originalFilename: 'novo.pdf' },
      actor,
    );
    expect(update).toHaveBeenCalledWith(id, {
      originalFilename: 'novo.pdf',
      updatedBy: actor.id,
    });
    expect(record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: AuditAction.UPDATE,
        entityType: 'document',
      }),
      expect.anything(),
    );
    expect(out.originalFilename).toBe('novo.pdf');
  });

  it('inexistente → 404, não atualiza', async () => {
    findById.mockResolvedValue(null);
    await expect(
      service.execute(id, { originalFilename: 'x' }, actor),
    ).rejects.toBeInstanceOf(CustomHttpException);
    expect(update).not.toHaveBeenCalled();
  });
});
