import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { LandingRequestStatus, UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import type { UserRepository } from '@/modules/users/repositories/user.repository';

import type { LandingRequestRepository } from '../repositories/landing-request.repository';
import { PendingCountLandingRequestsService } from './pending-count-landing-requests.service';

const admin: AuthenticatedUser = {
  id: 'admin-1',
  email: 'a@a.com',
  role: UserRole.ADMIN,
};
const coordinator: AuthenticatedUser = {
  id: 'coord-1',
  email: 'c@c.com',
  role: UserRole.COORDINATOR,
};

describe('PendingCountLandingRequestsService', () => {
  let service: PendingCountLandingRequestsService;
  let count: jest.Mock;
  let findActiveById: jest.Mock;

  beforeEach(() => {
    count = jest.fn().mockResolvedValue(4);
    findActiveById = jest.fn();
    service = new PendingCountLandingRequestsService(
      { count } as unknown as LandingRequestRepository,
      { findActiveById } as unknown as UserRepository,
      new ErrorMessageService(),
    );
  });

  it('ADMIN: conta pendentes sem restrição de grupo', async () => {
    const out = await service.execute(admin);
    expect(count).toHaveBeenCalledWith({
      status: LandingRequestStatus.PENDING,
    });
    expect(out).toEqual({ count: 4 });
  });

  it('COORDINATOR com grupo: conta pendentes só do próprio grupo', async () => {
    findActiveById.mockResolvedValue({ groupId: 'grp-9' });
    await service.execute(coordinator);
    expect(count).toHaveBeenCalledWith({
      aerodrome: { groupId: 'grp-9' },
      status: LandingRequestStatus.PENDING,
    });
  });
});
