import { UserRole } from '@/generated/prisma/client';

import type { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { buildAuthenticatedUserFixture } from '@/modules/auth/testing/authenticated-user.fixtures';
import type { UserRepository } from '@/modules/users/repositories/user.repository';

import type { TechnicalVisitRepository } from '../repositories/technical-visit.repository';
import { buildTechnicalVisitWithAerodromeFixture } from '../testing/technical-visit.entity.fixture';

import { ListTechnicalVisitsService } from './list-technical-visits.service';

const actor = buildAuthenticatedUserFixture({
  id: '33333333-3333-4333-8333-333333333333',
  email: 'actor@test.com',
  role: UserRole.ADMIN,
});

describe('ListTechnicalVisitsService', () => {
  let service: ListTechnicalVisitsService;
  let findMany: jest.Mock;
  let count: jest.Mock;

  beforeEach(() => {
    findMany = jest.fn();
    count = jest.fn();
    const repo = { findMany, count } as unknown as TechnicalVisitRepository;
    service = new ListTechnicalVisitsService(
      repo,
      {
        findActiveById: jest.fn().mockResolvedValue({ groupId: 'g1' }),
        findManyByIds: jest.fn().mockResolvedValue([]),
      } as unknown as UserRepository,
      { getMessage: jest.fn() } as unknown as ErrorMessageService,
    );
  });

  it('admin lista sem filtro de grupo', async () => {
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(0);
    await service.execute({}, actor);
    expect(findMany).toHaveBeenCalledWith({}, 0, 10);
    expect(count).toHaveBeenCalledWith({});
  });

  it('filtra aerodromeId', async () => {
    const aid = '22222222-2222-4222-8222-222222222222';
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(0);
    await service.execute({ aerodromeId: aid }, actor);
    const w = { aerodromeId: aid };
    expect(findMany).toHaveBeenCalledWith(w, 0, 10);
    expect(count).toHaveBeenCalledWith(w);
  });

  it('paginação com batch de modifiers (uma query de usuários)', async () => {
    const row = buildTechnicalVisitWithAerodromeFixture({
      modifierUsers: ['33333333-3333-4333-8333-333333333333'],
      modifierAtTimes: [new Date('2024-06-01T12:00:00.000Z')],
    });
    findMany.mockResolvedValue([row]);
    count.mockResolvedValue(11);
    const findManyByIds = jest.fn().mockResolvedValue([]);
    service = new ListTechnicalVisitsService(
      { findMany, count } as unknown as TechnicalVisitRepository,
      {
        findActiveById: jest.fn().mockResolvedValue({ groupId: 'g1' }),
        findManyByIds,
      } as unknown as UserRepository,
      { getMessage: jest.fn() } as unknown as ErrorMessageService,
    );
    const out = await service.execute({ page: 2, limit: 10 }, actor);
    expect(findMany).toHaveBeenCalledWith({}, 10, 10);
    expect(findManyByIds).toHaveBeenCalledTimes(1);
    expect(out.data[0].id).toBe(row.id);
  });
});
