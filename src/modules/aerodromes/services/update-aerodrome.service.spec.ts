import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

import { patchAerodromeToPrisma } from '../mappers/aerodrome.prisma.mapper';
import type { AerodromeRepository } from '../repositories/aerodrome.repository';
import { buildAerodromeFixture } from '../testing/aerodrome.entity.fixture';

import { UpdateAerodromeService } from './update-aerodrome.service';

describe('UpdateAerodromeService', () => {
  let service: UpdateAerodromeService;
  let findById: jest.Mock;
  let update: jest.Mock;

  beforeEach(() => {
    findById = jest.fn();
    update = jest.fn();
    const repo = {
      findById,
      update,
    } as unknown as AerodromeRepository;
    service = new UpdateAerodromeService(repo, new ErrorMessageService());
  });

  const id = '11111111-1111-4111-8111-111111111111';
  const gid = '44444444-4444-4444-8444-444444444444';
  const gid2 = '55555555-5555-4555-8555-555555555555';

  it('404', async () => {
    findById.mockResolvedValue(null);
    try {
      await service.execute({ id, name: 'x' });
      throw new Error('expected');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
    expect(update).not.toHaveBeenCalled();
  });

  it('patch sem groupId só campos prisma', async () => {
    findById.mockResolvedValue(buildAerodromeFixture({ id }));
    update.mockResolvedValue(buildAerodromeFixture({ id, name: 'Novo nome' }));
    await service.execute({ id, name: 'Novo nome' });
    expect(update).toHaveBeenCalledWith(
      id,
      patchAerodromeToPrisma({ name: 'Novo nome' }),
    );
  });

  it('groupId acrescenta connect.group ao patch', async () => {
    findById.mockResolvedValue(buildAerodromeFixture({ id, groupId: gid }));
    update.mockResolvedValue(buildAerodromeFixture({ id, groupId: gid2 }));

    await service.execute({
      id,
      groupId: gid2,
      icao: 'SDZY',
    });

    expect(update).toHaveBeenCalledWith(
      id,
      expect.objectContaining({
        group: { connect: { id: gid2 } },
        icao: 'SDZY',
      }),
    );
  });
});
