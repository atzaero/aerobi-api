import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

import type { OperationalAerodromeRepository } from '../repositories/operational-aerodrome.repository';
import { buildOperationalAerodromeFixture } from '../testing/operational-aerodrome.entity.fixture';

import { RemoveOperationalAerodromeService } from './remove-operational-aerodrome.service';

describe('RemoveOperationalAerodromeService', () => {
  let service: RemoveOperationalAerodromeService;
  let findById: jest.Mock;
  let softDelete: jest.Mock;

  beforeEach(() => {
    findById = jest.fn();
    softDelete = jest.fn();
    const repo = {
      findById,
      softDelete,
    } as unknown as OperationalAerodromeRepository;
    service = new RemoveOperationalAerodromeService(
      repo,
      new ErrorMessageService(),
    );
  });

  const id = '11111111-1111-4111-8111-111111111111';

  it('404', async () => {
    findById.mockResolvedValue(null);
    try {
      await service.execute({ id, deletedBy: 'x' });
      throw new Error('expected');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
  });

  it('soft delete', async () => {
    findById.mockResolvedValue(buildOperationalAerodromeFixture({ id }));
    softDelete.mockResolvedValue(
      buildOperationalAerodromeFixture({
        id,
        deletedBy: 'd',
        deletedAt: new Date('2027-01-01T00:00:00.000Z'),
      }),
    );
    await service.execute({ id, deletedBy: 'd' });
    expect(softDelete).toHaveBeenCalledWith(id, 'd');
  });
});
