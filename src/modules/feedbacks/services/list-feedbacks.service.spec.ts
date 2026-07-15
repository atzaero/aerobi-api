import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { FeedbackRating, UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import type { UserRepository } from '@/modules/users/repositories/user.repository';

import type { FeedbackRepository } from '../repositories/feedback.repository';
import { buildFeedbackFixture } from '../testing/feedback.entity.fixture';

import { ListFeedbacksService } from './list-feedbacks.service';

describe('ListFeedbacksService', () => {
  let service: ListFeedbacksService;
  let findMany: jest.Mock;
  let count: jest.Mock;
  let findActiveById: jest.Mock;

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

  beforeEach(() => {
    findMany = jest.fn().mockResolvedValue([]);
    count = jest.fn().mockResolvedValue(0);
    findActiveById = jest.fn();
    const repo = { findMany, count } as unknown as FeedbackRepository;
    const userRepo = { findActiveById } as unknown as UserRepository;
    service = new ListFeedbacksService(
      repo,
      userRepo,
      new ErrorMessageService(),
    );
  });

  it('ADMIN: sem restrição de grupo, where vazio', async () => {
    await service.execute({}, admin);
    expect(findActiveById).not.toHaveBeenCalled();
    expect(findMany).toHaveBeenCalledWith({}, 0, 10);
  });

  it('ADMIN: aplica filtros de rating/aeródromo/intervalo de data', async () => {
    const aid = '22222222-2222-4222-8222-222222222222';
    await service.execute(
      {
        aerodromeId: aid,
        rating: FeedbackRating.POSITIVE,
        startDate: '2026-01-01',
        endDate: '2026-01-31',
      },
      admin,
    );
    expect(findMany).toHaveBeenCalledWith(
      {
        aerodromeId: aid,
        rating: FeedbackRating.POSITIVE,
        feedbackDate: {
          gte: new Date('2026-01-01T00:00:00.000Z'),
          lte: new Date('2026-01-31T00:00:00.000Z'),
        },
      },
      0,
      10,
    );
  });

  it('COORDINATOR com grupo: restringe via aerodrome.groupId', async () => {
    findActiveById.mockResolvedValue({ groupId: 'grp-9' });
    await service.execute({}, coordinator);
    expect(findMany).toHaveBeenCalledWith(
      { aerodrome: { groupId: 'grp-9' } },
      0,
      10,
    );
  });

  it('COORDINATOR sem grupo: where fail-closed (nunca "fail open")', async () => {
    findActiveById.mockResolvedValue({ groupId: null });
    await service.execute({}, coordinator);
    expect(findMany).toHaveBeenCalledWith({ id: { in: [] } }, 0, 10);
  });

  it('ator inativo (registro null): 401, sem tocar no repo', async () => {
    findActiveById.mockResolvedValue(null);
    await expect(service.execute({}, coordinator)).rejects.toBeInstanceOf(
      CustomHttpException,
    );
    expect(findMany).not.toHaveBeenCalled();
  });

  it('paginação: devolve os dados mapeados', async () => {
    const row = buildFeedbackFixture();
    findMany.mockResolvedValue([row]);
    count.mockResolvedValue(2);
    const out = await service.execute({ page: 2, limit: 10 }, admin);
    expect(findMany).toHaveBeenCalledWith({}, 10, 10);
    expect(out.data[0].id).toBe(row.id);
  });
});
