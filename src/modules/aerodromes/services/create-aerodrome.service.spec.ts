import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import type { UserRepository } from '@/modules/users/repositories/user.repository';

import type { CreateAerodromeDTO } from '../dtos/create-aerodrome.dto';
import type { AerodromeRepository } from '../repositories/aerodrome.repository';
import { buildAerodromeWithGroupFixture } from '../testing/aerodrome.entity.fixture';

import { CreateAerodromeService } from './create-aerodrome.service';

describe('CreateAerodromeService', () => {
  let service: CreateAerodromeService;
  let create: jest.Mock;
  let findActiveGroup: jest.Mock;
  let findActiveById: jest.Mock;

  const gid = '44444444-4444-4444-8444-444444444444';
  const admin: AuthenticatedUser = {
    id: 'admin-1',
    email: 'a@x.com',
    role: UserRole.ADMIN,
  };

  const dto = (): CreateAerodromeDTO => ({
    groupId: gid,
    icao: 'SBSP',
    name: 'Congonhas',
    latitude: '03°27\'18.50"S',
    longitude: '041°36\'16.91"W',
    altitude: '100',
  });

  beforeEach(() => {
    create = jest.fn();
    findActiveGroup = jest.fn().mockResolvedValue({ id: gid });
    findActiveById = jest.fn();
    const repo = { create, findActiveGroup } as unknown as AerodromeRepository;
    const userRepo = { findActiveById } as unknown as UserRepository;
    service = new CreateAerodromeService(
      repo,
      userRepo,
      new ErrorMessageService(),
    );
  });

  it('ADMIN cria: valida grupo, persiste e expõe uf derivada', async () => {
    create.mockResolvedValue(
      buildAerodromeWithGroupFixture({ groupId: gid, icao: 'SBSP' }),
    );
    const out = await service.execute(dto(), admin);
    expect(findActiveGroup).toHaveBeenCalledWith(gid);
    expect(create).toHaveBeenCalled();
    expect(out.icao).toBe('SBSP');
    expect(out.uf).toBe('PI');
  });

  it('grupo inexistente/removido → VALIDATION_FAILED', async () => {
    findActiveGroup.mockResolvedValue(null);
    try {
      await service.execute(dto(), admin);
      throw new Error('expected');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.VALIDATION_FAILED,
      );
    }
    expect(create).not.toHaveBeenCalled();
  });

  it('COORDINATOR de outro grupo → FORBIDDEN', async () => {
    const coord: AuthenticatedUser = {
      id: 'c1',
      email: 'c@x.com',
      role: UserRole.COORDINATOR,
    };
    findActiveById.mockResolvedValue({ groupId: 'other-group' });
    try {
      await service.execute(dto(), coord);
      throw new Error('expected');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.FORBIDDEN,
      );
    }
    expect(create).not.toHaveBeenCalled();
  });

  it('ICAO duplicado no grupo (P2002) → CONFLICT', async () => {
    create.mockRejectedValue({ code: 'P2002' });
    try {
      await service.execute(dto(), admin);
      throw new Error('expected');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.CONFLICT,
      );
    }
  });
});
