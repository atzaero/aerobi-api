import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { Uf, UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import type { StorageService } from '@/modules/storage/services/storage.service';
import type { UserRepository } from '@/modules/users/repositories/user.repository';

import type { GroupRepository } from '../repositories/group.repository';
import { buildGroupFixture } from '../testing/group.entity.fixture';

import { ListGroupsService } from './list-groups.service';

const admin: AuthenticatedUser = {
  id: 'admin-1',
  email: 'admin@e',
  role: UserRole.ADMIN,
};
const coordinator: AuthenticatedUser = {
  id: 'coord-1',
  email: 'coord@e',
  role: UserRole.COORDINATOR,
};

describe('ListGroupsService', () => {
  let service: ListGroupsService;
  let findMany: jest.Mock;
  let count: jest.Mock;
  let findActiveById: jest.Mock;

  beforeEach(() => {
    findMany = jest.fn();
    count = jest.fn();
    findActiveById = jest.fn();
    const repo = { findMany, count } as unknown as GroupRepository;
    const userRepo = { findActiveById } as unknown as UserRepository;
    const storage = {
      getPresignedUrl: jest.fn(),
    } as unknown as StorageService;
    service = new ListGroupsService(
      repo,
      userRepo,
      storage,
      new ErrorMessageService(),
    );
  });

  it('ADMIN: where vazio quando sem filtros, sem consultar escopo', async () => {
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(0);
    await service.execute({}, admin);
    expect(findMany).toHaveBeenCalledWith({}, 0, 10);
    expect(findActiveById).not.toHaveBeenCalled();
  });

  it('filtra por uf e name (substring case-insensitive)', async () => {
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(0);
    await service.execute({ uf: Uf.SP, name: 'int' }, admin);
    const w = {
      uf: Uf.SP,
      name: { contains: 'int', mode: 'insensitive' },
    };
    expect(findMany).toHaveBeenCalledWith(w, 0, 10);
    expect(count).toHaveBeenCalledWith(w);
  });

  it('COORDINATOR com grupo: força where.id ao próprio grupo', async () => {
    findActiveById.mockResolvedValue({ groupId: 'group-9' });
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(0);
    await service.execute({ name: 'x' }, coordinator);
    const w = {
      name: { contains: 'x', mode: 'insensitive' },
      id: 'group-9',
    };
    expect(findMany).toHaveBeenCalledWith(w, 0, 10);
  });

  it('COORDINATOR com grupo + filtro uf: where combina id e uf', async () => {
    findActiveById.mockResolvedValue({ groupId: 'group-9' });
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(0);
    await service.execute({ uf: Uf.SP }, coordinator);
    expect(findMany).toHaveBeenCalledWith({ uf: Uf.SP, id: 'group-9' }, 0, 10);
  });

  it('COORDINATOR sem grupo: where fail-closed (id in []), página vazia', async () => {
    findActiveById.mockResolvedValue({ groupId: null });
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(0);
    const out = await service.execute({}, coordinator);
    expect(out.data).toEqual([]);
    expect(out.meta.totalItems).toBe(0);
    /** O invariante de segurança vive no builder: o `none` vira um `where` que
     * nunca casa registro, em vez de short-circuit por serviço (#383). */
    expect(findMany).toHaveBeenCalledWith({ id: { in: [] } }, 0, 10);
    expect(count).toHaveBeenCalledWith({ id: { in: [] } });
  });

  it('COORDINATOR inativo/soft-deletado (registro null): 401, sem tocar no repo', async () => {
    findActiveById.mockResolvedValue(null);
    await expect(service.execute({}, coordinator)).rejects.toBeInstanceOf(
      CustomHttpException,
    );
    expect(findMany).not.toHaveBeenCalled();
  });

  it('paginação (ADMIN)', async () => {
    const row = buildGroupFixture();
    findMany.mockResolvedValue([row]);
    count.mockResolvedValue(3);
    const out = await service.execute({ page: 2, limit: 10 }, admin);
    expect(findMany).toHaveBeenCalledWith({}, 10, 10);
    expect(out.data[0].id).toBe(row.id);
  });
});
