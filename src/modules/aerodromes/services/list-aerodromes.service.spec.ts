import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import type { UserRepository } from '@/modules/users/repositories/user.repository';

import type { AerodromeRepository } from '../repositories/aerodrome.repository';
import { buildAerodromeWithGroupFixture } from '../testing/aerodrome.entity.fixture';

import { ListAerodromesService } from './list-aerodromes.service';

describe('ListAerodromesService', () => {
  let service: ListAerodromesService;
  let findMany: jest.Mock;
  let count: jest.Mock;
  let findActiveById: jest.Mock;

  const gid = '44444444-4444-4444-8444-444444444444';
  const admin: AuthenticatedUser = {
    id: 'a',
    email: 'a@x',
    role: UserRole.ADMIN,
  };

  beforeEach(() => {
    findMany = jest.fn().mockResolvedValue([]);
    count = jest.fn().mockResolvedValue(0);
    findActiveById = jest.fn();
    const repo = { findMany, count } as unknown as AerodromeRepository;
    const userRepo = { findActiveById } as unknown as UserRepository;
    service = new ListAerodromesService(
      repo,
      userRepo,
      new ErrorMessageService(),
    );
  });

  it('ADMIN sem filtros → where vazio', async () => {
    await service.execute({}, admin);
    expect(findMany).toHaveBeenCalledWith({}, 0, 10);
    expect(findActiveById).not.toHaveBeenCalled();
  });

  it('search vira OR em icao/name/municipality', async () => {
    await service.execute({ search: 'sb' }, admin);
    expect(findMany).toHaveBeenCalledWith(
      {
        OR: [
          { icao: { contains: 'sb', mode: 'insensitive' } },
          { name: { contains: 'sb', mode: 'insensitive' } },
          { municipality: { contains: 'sb', mode: 'insensitive' } },
        ],
      },
      0,
      10,
    );
  });

  it('COORDINATOR fica preso ao próprio grupo (ignora groupId do filtro)', async () => {
    const coord: AuthenticatedUser = {
      id: 'c',
      email: 'c@x',
      role: UserRole.COORDINATOR,
    };
    findActiveById.mockResolvedValue({ groupId: gid });
    await service.execute({ groupId: 'other-group' }, coord);
    expect(findMany).toHaveBeenCalledWith({ groupId: gid }, 0, 10);
  });

  it('OPERATOR sem grupo (none) → where fail-closed', async () => {
    const op: AuthenticatedUser = {
      id: 'o',
      email: 'o@x',
      role: UserRole.OPERATOR,
    };
    findActiveById.mockResolvedValue({ groupId: null });
    await service.execute({}, op);
    expect(findMany).toHaveBeenCalledWith({ id: { in: [] } }, 0, 10);
  });

  it('paginação e mapeamento', async () => {
    const row = buildAerodromeWithGroupFixture();
    findMany.mockResolvedValue([row]);
    count.mockResolvedValue(21);
    const out = await service.execute({ page: 2 }, admin);
    expect(findMany).toHaveBeenCalledWith({}, 10, 10);
    expect(out.data[0].id).toBe(row.id);
    expect(out.data[0].uf).toBe('PI');
  });
});
