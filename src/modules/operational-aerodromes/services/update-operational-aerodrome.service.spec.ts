import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

import { patchOperationalAerodromeToPrisma } from '../mappers/operational-aerodrome.prisma.mapper';
import type { OperationalAerodromeRepository } from '../repositories/operational-aerodrome.repository';
import { buildOperationalAerodromeFixture } from '../testing/operational-aerodrome.entity.fixture';

import { UpdateOperationalAerodromeService } from './update-operational-aerodrome.service';

describe('UpdateOperationalAerodromeService', () => {
  let service: UpdateOperationalAerodromeService;
  let findById: jest.Mock;
  let update: jest.Mock;

  beforeEach(() => {
    findById = jest.fn();
    update = jest.fn();
    const repo = {
      findById,
      update,
    } as unknown as OperationalAerodromeRepository;
    service = new UpdateOperationalAerodromeService(
      repo,
      new ErrorMessageService(),
    );
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
    findById.mockResolvedValue(buildOperationalAerodromeFixture({ id }));
    update.mockResolvedValue(
      buildOperationalAerodromeFixture({ id, name: 'Novo nome' }),
    );
    await service.execute({ id, name: 'Novo nome' });
    expect(update).toHaveBeenCalledWith(
      id,
      patchOperationalAerodromeToPrisma({ name: 'Novo nome' }),
    );
  });

  it('groupId acrescenta connect.group ao patch', async () => {
    findById.mockResolvedValue(
      buildOperationalAerodromeFixture({ id, groupId: gid }),
    );
    update.mockResolvedValue(
      buildOperationalAerodromeFixture({ id, groupId: gid2 }),
    );

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
