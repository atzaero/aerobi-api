import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { GeojsonStatus, UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import type { UserRepository } from '@/modules/users/repositories/user.repository';

import type { GeojsonRepository } from '../repositories/geojson.repository';
import { buildGeojsonFixture } from '../testing/geojson.entity.fixture';

import { ListGeojsonsService } from './list-geojsons.service';

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

const aid = '22222222-2222-4222-8222-222222222222';

describe('ListGeojsonsService', () => {
  let service: ListGeojsonsService;
  let findMany: jest.Mock;
  let count: jest.Mock;
  let findActiveById: jest.Mock;

  beforeEach(() => {
    findMany = jest.fn().mockResolvedValue([]);
    count = jest.fn().mockResolvedValue(0);
    findActiveById = jest.fn();
    service = new ListGeojsonsService(
      { findMany, count } as unknown as GeojsonRepository,
      { findActiveById } as unknown as UserRepository,
      new ErrorMessageService(),
    );
  });

  it('ADMIN: sem restrição de grupo (não consulta o grupo do ator)', async () => {
    await service.execute({}, admin);
    expect(findActiveById).not.toHaveBeenCalled();
    expect(findMany).toHaveBeenCalledWith({}, 0, 10);
  });

  it('ADMIN: aplica filtros aerodromeId + status', async () => {
    await service.execute(
      { aerodromeId: aid, status: GeojsonStatus.ERROR },
      admin,
    );
    const where = { aerodromeId: aid, status: GeojsonStatus.ERROR };
    expect(findMany).toHaveBeenCalledWith(where, 0, 10);
    expect(count).toHaveBeenCalledWith(where);
  });

  it('OPERATOR com grupo: restringe via aerodrome.groupId (escopo operacional)', async () => {
    findActiveById.mockResolvedValue({ groupId: 'grp-9' });
    await service.execute({}, operator);
    expect(findMany).toHaveBeenCalledWith(
      { aerodrome: { groupId: 'grp-9' } },
      0,
      10,
    );
  });

  it('OPERATOR sem grupo: fail-closed', async () => {
    findActiveById.mockResolvedValue({ groupId: null });
    await service.execute({}, operator);
    expect(findMany).toHaveBeenCalledWith({ id: { in: [] } }, 0, 10);
  });

  it('paginação e mapeamento', async () => {
    const row = buildGeojsonFixture();
    findMany.mockResolvedValue([row]);
    count.mockResolvedValue(4);
    const out = await service.execute({ page: 2, limit: 2 }, admin);
    expect(findMany).toHaveBeenCalledWith({}, 2, 2);
    expect(out.data[0].id).toBe(row.id);
  });
});
