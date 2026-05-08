import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

import type { AerodromeGroupRepository } from '../repositories/aerodrome-group.repository';
import { buildAerodromeGroupFixture } from '../testing/aerodrome-group.entity.fixture';

import { RemoveAerodromeGroupService } from './remove-aerodrome-group.service';

describe('RemoveAerodromeGroupService', () => {
  let service: RemoveAerodromeGroupService;
  let findById: jest.Mock;
  let softDelete: jest.Mock;

  beforeEach(() => {
    findById = jest.fn();
    softDelete = jest.fn();
    const repo = {
      findById,
      softDelete,
    } as unknown as AerodromeGroupRepository;
    service = new RemoveAerodromeGroupService(repo, new ErrorMessageService());
  });

  const id = '11111111-1111-4111-8111-111111111111';

  it('404', async () => {
    findById.mockResolvedValue(null);
    try {
      await service.execute({ id, deletedBy: 'a' });
      throw new Error('expected');
    } catch (e) {
      expect(e).toBeInstanceOf(CustomHttpException);
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
  });

  it('soft delete', async () => {
    findById.mockResolvedValue(buildAerodromeGroupFixture({ id }));
    const del = buildAerodromeGroupFixture({
      id,
      deletedBy: 'b',
      deletedAt: new Date('2025-01-01T00:00:00.000Z'),
    });
    softDelete.mockResolvedValue(del);
    await service.execute({ id, deletedBy: 'b' });
    expect(softDelete).toHaveBeenCalledWith(id, 'b');
  });
});
