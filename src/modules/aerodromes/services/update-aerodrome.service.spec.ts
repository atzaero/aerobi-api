import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { UpdateAerodromeDTO } from '../dtos/update-aerodrome.dto';
import type { AerodromeRepository } from '../repositories/aerodrome.repository';
import { buildAerodromeWithGroupFixture } from '../testing/aerodrome.entity.fixture';

import { UpdateAerodromeService } from './update-aerodrome.service';

describe('UpdateAerodromeService', () => {
  let service: UpdateAerodromeService;
  let findById: jest.Mock;
  let update: jest.Mock;
  let findActiveGroup: jest.Mock;

  const id = '11111111-1111-4111-8111-111111111111';
  const gid = '44444444-4444-4444-8444-444444444444';
  const gid2 = '55555555-5555-4555-8555-555555555555';
  const admin: AuthenticatedUser = {
    id: 'a',
    email: 'a@x',
    role: UserRole.ADMIN,
  };
  const coord: AuthenticatedUser = {
    id: 'c',
    email: 'c@x',
    role: UserRole.COORDINATOR,
  };

  const baseDto = (
    over: Partial<UpdateAerodromeDTO> = {},
  ): UpdateAerodromeDTO => ({
    groupId: gid,
    icao: 'SDXX',
    name: 'Campo',
    latitude: '03°27\'18.50"S',
    longitude: '041°36\'16.91"W',
    altitude: '100',
    ...over,
  });

  beforeEach(() => {
    findById = jest.fn();
    update = jest.fn();
    findActiveGroup = jest.fn().mockResolvedValue({ id: gid2 });
    const repo = {
      findById,
      update,
      findActiveGroup,
    } as unknown as AerodromeRepository;
    service = new UpdateAerodromeService(repo, new ErrorMessageService());
  });

  it('404 quando inexistente', async () => {
    findById.mockResolvedValue(null);
    try {
      await service.execute(id, baseDto(), admin);
      throw new Error('expected');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
    expect(update).not.toHaveBeenCalled();
  });

  it('COORDINATOR não move entre grupos → FORBIDDEN', async () => {
    findById.mockResolvedValue(
      buildAerodromeWithGroupFixture({ id, groupId: gid }),
    );
    try {
      await service.execute(id, baseDto({ groupId: gid2 }), coord);
      throw new Error('expected');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.FORBIDDEN,
      );
    }
    expect(update).not.toHaveBeenCalled();
  });

  it('ADMIN edita no mesmo grupo: updatedBy real e sem revalidar grupo', async () => {
    findById.mockResolvedValue(
      buildAerodromeWithGroupFixture({ id, groupId: gid }),
    );
    update.mockResolvedValue(
      buildAerodromeWithGroupFixture({ id, groupId: gid, name: 'Novo' }),
    );
    await service.execute(id, baseDto({ name: 'Novo' }), admin);
    expect(findActiveGroup).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalledWith(
      id,
      expect.objectContaining({
        group: { connect: { id: gid } },
        updatedBy: 'a',
      }),
    );
  });

  it('ADMIN move de grupo: valida o destino', async () => {
    findById.mockResolvedValue(
      buildAerodromeWithGroupFixture({ id, groupId: gid }),
    );
    update.mockResolvedValue(
      buildAerodromeWithGroupFixture({ id, groupId: gid2 }),
    );
    await service.execute(id, baseDto({ groupId: gid2 }), admin);
    expect(findActiveGroup).toHaveBeenCalledWith(gid2);
  });

  it('ICAO duplicado (P2002) → CONFLICT', async () => {
    findById.mockResolvedValue(
      buildAerodromeWithGroupFixture({ id, groupId: gid }),
    );
    update.mockRejectedValue({ code: 'P2002' });
    try {
      await service.execute(id, baseDto({ icao: 'SDZY' }), admin);
      throw new Error('expected');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.CONFLICT,
      );
    }
  });
});
