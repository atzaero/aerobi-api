import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { LandingRequestStatus, UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import type { UserRepository } from '@/modules/users/repositories/user.repository';

import type { LandingRequestRepository } from '../repositories/landing-request.repository';
import { buildLandingRequestFixture } from '../testing/landing-request.entity.fixture';
import { ListLandingRequestsService } from './list-landing-requests.service';

const admin: AuthenticatedUser = {
  id: 'admin-1',
  email: 'a@a.com',
  role: UserRole.ADMIN,
};
const operator: AuthenticatedUser = {
  id: 'op-1',
  email: 'o@o.com',
  role: UserRole.OPERATOR,
};

describe('ListLandingRequestsService', () => {
  let service: ListLandingRequestsService;
  let findMany: jest.Mock;
  let count: jest.Mock;
  let findActiveById: jest.Mock;
  let findManyByIds: jest.Mock;

  beforeEach(() => {
    findMany = jest.fn().mockResolvedValue([]);
    count = jest.fn().mockResolvedValue(0);
    findActiveById = jest.fn();
    findManyByIds = jest.fn().mockResolvedValue([]);
    service = new ListLandingRequestsService(
      { findMany, count } as unknown as LandingRequestRepository,
      { findActiveById, findManyByIds } as unknown as UserRepository,
      new ErrorMessageService(),
    );
  });

  it('ADMIN: sem restrição de grupo (não consulta o grupo do ator)', async () => {
    await service.execute({}, admin);
    expect(findActiveById).not.toHaveBeenCalled();
    expect(findMany).toHaveBeenCalledWith({}, 0, 10, expect.any(Array));
  });

  it('OPERATOR com grupo: restringe via aerodrome.groupId (escopo operacional)', async () => {
    findActiveById.mockResolvedValue({ groupId: 'grp-9' });
    await service.execute({}, operator);
    expect(findMany).toHaveBeenCalledWith(
      { aerodrome: { groupId: 'grp-9' } },
      0,
      10,
      expect.any(Array),
    );
  });

  it('OPERATOR sem grupo: fail-closed', async () => {
    findActiveById.mockResolvedValue({ groupId: null });
    await service.execute({}, operator);
    expect(findMany).toHaveBeenCalledWith(
      { id: { in: [] } },
      0,
      10,
      expect.any(Array),
    );
  });

  it('filtro approved: ordena por responseDate desc (paridade com o web)', async () => {
    await service.execute({ status: LandingRequestStatus.APPROVED }, admin);
    expect(findMany).toHaveBeenCalledWith(
      { status: LandingRequestStatus.APPROVED },
      0,
      10,
      [{ reviewedAt: 'desc' }, { requestDate: 'desc' }, { id: 'desc' }],
    );
  });

  it('mascara o CPF no response', async () => {
    findMany.mockResolvedValue([
      buildLandingRequestFixture({ pilotCpf: '12345678909' }),
    ]);
    count.mockResolvedValue(1);
    const out = await service.execute({}, admin);
    expect(out.data[0].pilotCpf).toBe('123.456.***-**');
  });
});
