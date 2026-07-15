import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import type { UserRepository } from '@/modules/users/repositories/user.repository';

import type { CameraRepository } from '../repositories/camera.repository';
import { buildCameraFixture } from '../testing/camera.entity.fixture';

import { ListCamerasService } from './list-cameras.service';

describe('ListCamerasService', () => {
  let service: ListCamerasService;
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
    const repo = { findMany, count } as unknown as CameraRepository;
    const userRepo = { findActiveById } as unknown as UserRepository;
    service = new ListCamerasService(repo, userRepo, new ErrorMessageService());
  });

  it('ADMIN: sem restrição de grupo, where vazio', async () => {
    await service.execute({}, admin);
    expect(findActiveById).not.toHaveBeenCalled();
    expect(findMany).toHaveBeenCalledWith({}, 0, 10);
  });

  it('ADMIN: aplica filtros icao (igualdade) + name (substring)', async () => {
    await service.execute({ icao: 'SBXX', name: 'cab' }, admin);
    expect(findMany).toHaveBeenCalledWith(
      {
        icao: { equals: 'SBXX', mode: 'insensitive' },
        name: { contains: 'cab', mode: 'insensitive' },
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

  it('COORDINATOR sem grupo: where fail-closed', async () => {
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
    findMany.mockResolvedValue([buildCameraFixture()]);
    count.mockResolvedValue(2);
    const out = await service.execute({ page: 2, limit: 10 }, admin);
    expect(findMany).toHaveBeenCalledWith({}, 10, 10);
    expect(out.data[0].id).toBe('11111111-1111-4111-8111-111111111111');
    expect(out.meta.totalItems).toBe(2);
  });
});
