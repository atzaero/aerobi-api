import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { UserRole, type Prisma } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import type { UserRepository } from '@/modules/users/repositories/user.repository';

import type { CreateCameraDTO } from '../dtos/create-camera.dto';
import type { CameraRepository } from '../repositories/camera.repository';
import { buildCameraFixture } from '../testing/camera.entity.fixture';

import type { CameraQueryService } from './camera-query.service';
import { CreateCameraService } from './create-camera.service';

describe('CreateCameraService', () => {
  let service: CreateCameraService;
  let create: jest.Mock;
  let findActiveAerodrome: jest.Mock;
  let findActiveStreamConflict: jest.Mock;
  let findActiveById: jest.Mock;
  let invalidate: jest.Mock;

  const aerodromeId = '22222222-2222-4222-8222-222222222222';
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

  const dto = (o: Partial<CreateCameraDTO> = {}): CreateCameraDTO => ({
    aerodromeId,
    name: 'Cabeceira 06',
    mediamtxNode: 'aerobi-edge-mvp',
    mediamtxPath: 'sbxx-cam-1',
    ...o,
  });

  const expectCode = async (p: Promise<unknown>, code: ErrorCode) => {
    try {
      await p;
      throw new Error('expected a CustomHttpException');
    } catch (e) {
      expect(e).toBeInstanceOf(CustomHttpException);
      expect((e as CustomHttpException).getErrorCode()).toBe(code);
    }
  };

  beforeEach(() => {
    create = jest.fn();
    findActiveAerodrome = jest.fn();
    findActiveStreamConflict = jest.fn().mockResolvedValue(null);
    findActiveById = jest.fn();
    invalidate = jest.fn();
    const repo = {
      create,
      findActiveAerodrome,
      findActiveStreamConflict,
    } as unknown as CameraRepository;
    const userRepo = { findActiveById } as unknown as UserRepository;
    const cameraQuery = { invalidate } as unknown as CameraQueryService;
    service = new CreateCameraService(
      repo,
      userRepo,
      new ErrorMessageService(),
      cameraQuery,
    );
  });

  it('404 quando o aeródromo não existe/está removido', async () => {
    findActiveAerodrome.mockResolvedValue(null);
    await expectCode(
      service.execute(dto(), admin),
      ErrorCode.RESOURCE_NOT_FOUND,
    );
    expect(create).not.toHaveBeenCalled();
  });

  it('COORDINATOR: aeródromo de outro grupo → 404 uniforme (não vaza existência)', async () => {
    findActiveAerodrome.mockResolvedValue({
      id: aerodromeId,
      groupId: 'other',
      icao: 'SBXX',
    });
    findActiveById.mockResolvedValue({ groupId: 'mine' });
    await expectCode(
      service.execute(dto(), coordinator),
      ErrorCode.RESOURCE_NOT_FOUND,
    );
    expect(create).not.toHaveBeenCalled();
  });

  it('COORDINATOR sem grupo (none) → 404 uniforme', async () => {
    findActiveAerodrome.mockResolvedValue({
      id: aerodromeId,
      groupId: 'g',
      icao: 'SBXX',
    });
    findActiveById.mockResolvedValue({ groupId: null });
    await expectCode(
      service.execute(dto(), coordinator),
      ErrorCode.RESOURCE_NOT_FOUND,
    );
    expect(create).not.toHaveBeenCalled();
  });

  it('stream duplicado no pré-check → 409, sem criar', async () => {
    findActiveAerodrome.mockResolvedValue({
      id: aerodromeId,
      groupId: 'g',
      icao: 'SBXX',
    });
    findActiveStreamConflict.mockResolvedValue({ id: 'other' });
    await expectCode(service.execute(dto(), admin), ErrorCode.CONFLICT);
    expect(create).not.toHaveBeenCalled();
  });

  it('sucesso: deriva icao (uppercase) do aeródromo, createdBy=ator, enabled default true', async () => {
    findActiveAerodrome.mockResolvedValue({
      id: aerodromeId,
      groupId: 'g',
      icao: 'sbxx',
    });
    create.mockResolvedValue(buildCameraFixture());
    await service.execute(dto(), admin);
    const [[input]] = create.mock.calls as Array<[Prisma.CameraCreateInput]>;
    expect(input.icao).toBe('SBXX');
    expect(input.createdBy).toBe('admin-1');
    expect(input.enabled).toBe(true);
    expect(input.aerodrome).toEqual({ connect: { id: aerodromeId } });
    /** Invalida o cache do proxy pelo id recém-criado. */
    expect(invalidate).toHaveBeenCalledWith(buildCameraFixture().id);
  });

  it('P2002 no create → 409 (rede de segurança da corrida)', async () => {
    findActiveAerodrome.mockResolvedValue({
      id: aerodromeId,
      groupId: 'g',
      icao: 'SBXX',
    });
    create.mockRejectedValue({ code: 'P2002' });
    await expectCode(service.execute(dto(), admin), ErrorCode.CONFLICT);
  });
});
