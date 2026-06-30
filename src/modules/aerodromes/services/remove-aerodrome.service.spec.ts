import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

import type { AerodromeRepository } from '../repositories/aerodrome.repository';
import { buildAerodromeFixture } from '../testing/aerodrome.entity.fixture';

import { RemoveAerodromeService } from './remove-aerodrome.service';

describe('RemoveAerodromeService', () => {
  let service: RemoveAerodromeService;
  let findById: jest.Mock;
  let softDelete: jest.Mock;

  beforeEach(() => {
    findById = jest.fn();
    softDelete = jest.fn();
    const repo = {
      findById,
      softDelete,
    } as unknown as AerodromeRepository;
    service = new RemoveAerodromeService(repo, new ErrorMessageService());
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
    findById.mockResolvedValue(buildAerodromeFixture({ id }));
    softDelete.mockResolvedValue(
      buildAerodromeFixture({
        id,
        deletedBy: 'd',
        deletedAt: new Date('2027-01-01T00:00:00.000Z'),
      }),
    );
    await service.execute({ id, deletedBy: 'd' });
    expect(softDelete).toHaveBeenCalledWith(id, 'd');
  });
});
