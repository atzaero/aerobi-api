import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { AuditAction, UserRole } from '@/generated/prisma/client';
import type { AuditRecorderService } from '@/modules/audit/services/audit-recorder.service';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { LandingRequestRepository } from '../repositories/landing-request.repository';
import { buildLandingRequestFixture } from '../testing/landing-request.entity.fixture';
import { RemoveLandingRequestService } from './remove-landing-request.service';

const actor: AuthenticatedUser = {
  id: 'admin-1',
  email: 'a@a.com',
  role: UserRole.ADMIN,
};

describe('RemoveLandingRequestService', () => {
  let service: RemoveLandingRequestService;
  let findById: jest.Mock;
  let softDelete: jest.Mock;
  let record: jest.Mock;

  beforeEach(() => {
    findById = jest.fn().mockResolvedValue(buildLandingRequestFixture());
    softDelete = jest.fn().mockResolvedValue(buildLandingRequestFixture());
    record = jest.fn().mockResolvedValue(undefined);
    service = new RemoveLandingRequestService(
      { findById, softDelete } as unknown as LandingRequestRepository,
      new ErrorMessageService(),
      { record } as unknown as AuditRecorderService,
    );
  });

  it('soft-delete com ator real + auditoria DELETE', async () => {
    await service.execute('lr-1', actor);
    expect(softDelete).toHaveBeenCalledWith('lr-1', actor.id);
    expect(record).toHaveBeenCalledWith(
      expect.objectContaining({ action: AuditAction.DELETE }),
      expect.anything(),
    );
  });

  it('inexistente → 404, não remove', async () => {
    findById.mockResolvedValue(null);
    await expect(service.execute('lr-1', actor)).rejects.toBeInstanceOf(
      CustomHttpException,
    );
    expect(softDelete).not.toHaveBeenCalled();
  });
});
