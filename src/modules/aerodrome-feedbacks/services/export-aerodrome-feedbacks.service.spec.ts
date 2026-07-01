import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { FeedbackRating, UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import type { UserRepository } from '@/modules/users/repositories/user.repository';

import type { AerodromeFeedbackRepository } from '../repositories/aerodrome-feedback.repository';
import { buildAerodromeFeedbackFixture } from '../testing/aerodrome-feedback.entity.fixture';

import { ExportAerodromeFeedbacksService } from './export-aerodrome-feedbacks.service';

const HEADER = '\uFEFFAeródromo (ID),Avaliação,Comentário,Criado em (UTC)';

const admin: AuthenticatedUser = {
  id: 'admin-1',
  email: 'a@e',
  role: UserRole.ADMIN,
};
const coordinator: AuthenticatedUser = {
  id: 'coord-1',
  email: 'c@e',
  role: UserRole.COORDINATOR,
};

describe('ExportAerodromeFeedbacksService', () => {
  let service: ExportAerodromeFeedbacksService;
  let findMany: jest.Mock;
  let count: jest.Mock;
  let findActiveById: jest.Mock;

  beforeEach(() => {
    findMany = jest.fn();
    count = jest.fn();
    findActiveById = jest.fn();
    const repo = { findMany, count } as unknown as AerodromeFeedbackRepository;
    const userRepo = { findActiveById } as unknown as UserRepository;
    service = new ExportAerodromeFeedbacksService(
      repo,
      userRepo,
      new ErrorMessageService(),
    );
  });

  it('ADMIN: where vazio, busca MAX+1 sem paginação, cabeçalho + linha traduzida', async () => {
    findMany.mockResolvedValue([
      buildAerodromeFeedbackFixture({
        rating: FeedbackRating.POSITIVE,
        comment: 'bom',
      }),
    ]);
    const { csv, truncated } = await service.execute({}, admin);
    expect(findMany).toHaveBeenCalledWith({}, 0, 50_001);
    expect(csv.startsWith(HEADER)).toBe(true);
    expect(csv).toContain('\r\n');
    expect(csv).toContain('Positiva');
    expect(csv).toContain('bom');
    expect(truncated).toBe(false);
    expect(findActiveById).not.toHaveBeenCalled();
  });

  it('COORDINATOR com grupo: restringe via aerodrome.groupId', async () => {
    findActiveById.mockResolvedValue({ groupId: 'g9' });
    findMany.mockResolvedValue([]);
    await service.execute({ rating: FeedbackRating.NEGATIVE }, coordinator);
    expect(findMany).toHaveBeenCalledWith(
      { rating: FeedbackRating.NEGATIVE, aerodrome: { groupId: 'g9' } },
      0,
      50_001,
    );
  });

  it('COORDINATOR sem grupo: where fail-closed, CSV só cabeçalho', async () => {
    findActiveById.mockResolvedValue({ groupId: null });
    findMany.mockResolvedValue([]);
    const { csv } = await service.execute({}, coordinator);
    expect(csv).toBe(HEADER);
    expect(findMany).toHaveBeenCalledWith({ id: { in: [] } }, 0, 50_001);
  });

  it('ator inativo (registro null): 401, sem tocar no repo', async () => {
    findActiveById.mockResolvedValue(null);
    await expect(service.execute({}, coordinator)).rejects.toBeInstanceOf(
      CustomHttpException,
    );
    expect(findMany).not.toHaveBeenCalled();
  });

  it('trunca em EXPORT_MAX_ROWS e sinaliza truncated + total real', async () => {
    const warn = jest.spyOn(service['logger'], 'warn').mockImplementation();
    const one = buildAerodromeFeedbackFixture();
    findMany.mockResolvedValue(Array.from({ length: 50_001 }, () => one));
    count.mockResolvedValue(73_000);
    const { csv, truncated, total } = await service.execute({}, admin);
    expect(csv.split('\r\n')).toHaveLength(1 + 50_000);
    expect(truncated).toBe(true);
    expect(total).toBe(73_000);
    expect(warn).toHaveBeenCalled();
  });
});
