import { UserRole } from '@/generated/prisma/client';

import type { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { AuditAction } from '@/generated/prisma/client';
import type { AuditRecorderService } from '@/modules/audit/services/audit-recorder.service';
import { buildAuditContextFixture } from '@/modules/audit/testing/audit-context.fixtures';
import { buildAuthenticatedUserFixture } from '@/modules/auth/testing/authenticated-user.fixtures';

import { buildTechnicalVisitImageFixture } from '../testing/technical-visit-image.entity.fixture';
import type { TechnicalVisitImageRepository } from '../repositories/technical-visit-image.repository';
import type { StorageService } from '@/modules/storage/services/storage.service';

import { RemoveTechnicalVisitImageService } from './remove-technical-visit-image.service';

const actor = buildAuthenticatedUserFixture({
  id: '33333333-3333-4333-8333-333333333333',
  email: 'actor@test.com',
  role: UserRole.ADMIN,
});

const auditContext = buildAuditContextFixture();
const visitId = '11111111-1111-4111-8111-111111111111';
const imageId = '99999999-9999-4999-8999-999999999999';

describe('RemoveTechnicalVisitImageService', () => {
  let service: RemoveTechnicalVisitImageService;
  let findById: jest.Mock;
  let softDelete: jest.Mock;
  let remove: jest.Mock;
  let record: jest.Mock;

  beforeEach(() => {
    findById = jest.fn();
    softDelete = jest.fn();
    remove = jest.fn();
    record = jest.fn();
    service = new RemoveTechnicalVisitImageService(
      { findById, softDelete } as unknown as TechnicalVisitImageRepository,
      {
        delete: remove,
        getPresignedUrl: jest.fn().mockResolvedValue('https://signed'),
      } as unknown as StorageService,
      { getMessage: jest.fn() } as unknown as ErrorMessageService,
      { record } as unknown as AuditRecorderService,
    );
  });

  it('404 quando imagem não pertence à visita', async () => {
    findById.mockResolvedValue(
      buildTechnicalVisitImageFixture({
        id: imageId,
        technicalVisitId: 'other-visit',
      }),
    );
    await expect(
      service.execute(visitId, imageId, actor, auditContext),
    ).rejects.toBeInstanceOf(CustomHttpException);
    expect(remove).not.toHaveBeenCalled();
    expect(softDelete).not.toHaveBeenCalled();
    expect(record).not.toHaveBeenCalled();
  });

  it('faz soft-delete sem remover objeto MinIO e grava audit', async () => {
    const image = buildTechnicalVisitImageFixture({
      id: imageId,
      technicalVisitId: visitId,
    });
    findById.mockResolvedValue(image);
    softDelete.mockResolvedValue({
      ...image,
      deletedAt: new Date(),
      deletedBy: actor.id,
    });

    await service.execute(visitId, imageId, actor, auditContext);

    expect(remove).not.toHaveBeenCalled();
    expect(softDelete).toHaveBeenCalledWith(imageId, actor.id);
    expect(record).toHaveBeenCalledWith(
      {
        action: AuditAction.DELETE,
        entityType: 'technical_visit_image',
        entityId: imageId,
        before: {
          id: imageId,
          technicalVisitId: visitId,
          section: image.section,
          originalFilename: image.originalFilename,
        },
      },
      auditContext,
    );
  });
});
