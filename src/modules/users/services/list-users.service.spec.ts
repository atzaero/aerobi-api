import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { Uf, UserRole } from '@/generated/prisma/client';
import { buildAuthenticatedUserFixture } from '@/modules/auth/testing/authenticated-user.fixtures';

import type { ListUsersQueryDto } from '../dtos/list-users-query.dto';
import type { UserRepository } from '../repositories/user.repository';
import { buildUserFixture } from '../testing/user.fixtures';

import { ListUsersService } from './list-users.service';

const ADMIN = buildAuthenticatedUserFixture({
  id: 'admin-1',
  role: UserRole.ADMIN,
});
const COORDINATOR = buildAuthenticatedUserFixture({
  id: 'coord-1',
  role: UserRole.COORDINATOR,
});

const COORD_RECORD = buildUserFixture({
  id: 'coord-1',
  role: UserRole.COORDINATOR,
  aerodromeGroupId: 'group-a',
  state: Uf.SP,
});

describe('ListUsersService', () => {
  let service: ListUsersService;
  let findActiveById: jest.Mock;
  let findManyPaginated: jest.Mock;

  beforeEach(() => {
    findActiveById = jest.fn();
    findManyPaginated = jest.fn().mockResolvedValue({ rows: [], total: 0 });

    const userRepository = {
      findActiveById,
      findManyPaginated,
    } as unknown as UserRepository;

    service = new ListUsersService(userRepository, new ErrorMessageService());
  });

  const baseQuery: ListUsersQueryDto = { page: 1, limit: 10 };

  it('ADMIN: não força grupo (filtro livre/ausente)', async () => {
    findActiveById.mockResolvedValue(null); // irrelevante p/ ADMIN (scope `all`)

    await service.execute(baseQuery, ADMIN);

    const calls = findManyPaginated.mock.calls as Array<
      [{ aerodromeGroupId?: string }]
    >;
    expect(calls[0][0].aerodromeGroupId).toBeUndefined();
  });

  it('ADMIN: respeita o filtro de grupo informado na query', async () => {
    findActiveById.mockResolvedValue(null);

    await service.execute({ ...baseQuery, aerodromeGroupId: 'group-x' }, ADMIN);

    expect(findManyPaginated).toHaveBeenCalledWith(
      expect.objectContaining({ aerodromeGroupId: 'group-x' }),
    );
  });

  it('COORDINATOR: força o próprio grupo (ignora o da query)', async () => {
    findActiveById.mockResolvedValue(COORD_RECORD);

    await service.execute(
      { ...baseQuery, aerodromeGroupId: 'group-x' },
      COORDINATOR,
    );

    expect(findManyPaginated).toHaveBeenCalledWith(
      expect.objectContaining({ aerodromeGroupId: 'group-a' }),
    );
  });

  it('COORDINATOR sem grupo: retorna vazio sem consultar (sem fail open)', async () => {
    findActiveById.mockResolvedValue(
      buildUserFixture({
        id: 'coord-1',
        role: UserRole.COORDINATOR,
        aerodromeGroupId: null,
        state: null,
      }),
    );

    const result = await service.execute(baseQuery, COORDINATOR);

    expect(findManyPaginated).not.toHaveBeenCalled();
    expect(result.meta.totalItems).toBe(0);
    expect(result.data).toEqual([]);
  });

  it('COORDINATOR inativo/soft-deletado (registro null): 401, sem listar', async () => {
    findActiveById.mockResolvedValue(null);

    await expect(
      service.execute(baseQuery, COORDINATOR),
    ).rejects.toBeInstanceOf(CustomHttpException);
    expect(findManyPaginated).not.toHaveBeenCalled();
  });
});
