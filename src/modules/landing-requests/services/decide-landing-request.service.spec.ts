import type { EmailService } from '@/common/email/email.service';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { LandingRequestStatus, UserRole } from '@/generated/prisma/client';
import type { AuditRecorderService } from '@/modules/audit/services/audit-recorder.service';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import type { UserRepository } from '@/modules/users/repositories/user.repository';

import type { LandingRequestRepository } from '../repositories/landing-request.repository';
import { buildLandingRequestFixture } from '../testing/landing-request.entity.fixture';
import { DecideLandingRequestService } from './decide-landing-request.service';

const actor: AuthenticatedUser = {
  id: 'coord-1',
  email: 'coord@a.com',
  role: UserRole.COORDINATOR,
};

const pending = () =>
  buildLandingRequestFixture({ status: LandingRequestStatus.PENDING });
const approved = () =>
  buildLandingRequestFixture({
    status: LandingRequestStatus.APPROVED,
    reviewedBy: actor.id,
  });

describe('DecideLandingRequestService', () => {
  let service: DecideLandingRequestService;
  let findById: jest.Mock;
  let updateIfPending: jest.Mock;
  let findTargetAerodrome: jest.Mock;
  let findUser: jest.Mock;
  let send: jest.Mock;
  let record: jest.Mock;

  beforeEach(() => {
    findById = jest.fn();
    updateIfPending = jest.fn().mockResolvedValue(1);
    findTargetAerodrome = jest.fn().mockResolvedValue({
      id: 'aero-1',
      icao: 'SBSP',
      name: 'Congonhas',
      isOpen: true,
      groupId: 'grp-1',
      uf: 'SP',
    });
    findUser = jest.fn().mockResolvedValue({
      id: actor.id,
      name: 'Coord',
      email: actor.email,
      role: actor.role,
    });
    send = jest.fn().mockResolvedValue(true);
    record = jest.fn().mockResolvedValue(undefined);

    service = new DecideLandingRequestService(
      {
        findById,
        updateIfPending,
        findTargetAerodrome,
      } as unknown as LandingRequestRepository,
      { findById: findUser } as unknown as UserRepository,
      { send } as unknown as EmailService,
      { record } as unknown as AuditRecorderService,
      new ErrorMessageService(),
    );
  });

  it('PENDING → APPROVED: atualização atômica, audita e notifica o solicitante', async () => {
    findById.mockResolvedValueOnce(pending()).mockResolvedValueOnce(approved());
    const out = await service.execute(
      'lr-1',
      { decision: LandingRequestStatus.APPROVED },
      actor,
    );
    expect(updateIfPending).toHaveBeenCalledTimes(1);
    expect(record).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalled();
    expect(out.status).toBe(LandingRequestStatus.APPROVED);
    expect(out.reviewer?.id).toBe(actor.id);
  });

  it('já respondida / corrida perdida (0 linhas afetadas) → 409', async () => {
    findById.mockResolvedValue(approved());
    updateIfPending.mockResolvedValue(0);
    await expect(
      service.execute(
        'lr-1',
        { decision: LandingRequestStatus.REJECTED },
        actor,
      ),
    ).rejects.toBeInstanceOf(CustomHttpException);
    expect(record).not.toHaveBeenCalled();
  });

  it('inexistente → 404, não atualiza', async () => {
    findById.mockResolvedValue(null);
    await expect(
      service.execute(
        'lr-1',
        { decision: LandingRequestStatus.APPROVED },
        actor,
      ),
    ).rejects.toBeInstanceOf(CustomHttpException);
    expect(updateIfPending).not.toHaveBeenCalled();
  });
});
