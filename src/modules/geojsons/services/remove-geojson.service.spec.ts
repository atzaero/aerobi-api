import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

import type { GeojsonRepository } from '../repositories/geojson.repository';
import { buildGeojsonFixture } from '../testing/geojson.entity.fixture';

import { RemoveGeojsonService } from './remove-geojson.service';

describe('RemoveGeojsonService', () => {
  let service: RemoveGeojsonService;
  let findById: jest.Mock;
  let softDelete: jest.Mock;

  beforeEach(() => {
    findById = jest.fn();
    softDelete = jest.fn();
    const repo = {
      findById,
      softDelete,
    } as unknown as GeojsonRepository;
    service = new RemoveGeojsonService(repo, new ErrorMessageService());
  });

  const id = '11111111-1111-4111-8111-111111111111';

  it('404', async () => {
    findById.mockResolvedValue(null);
    try {
      await service.execute({ id, deletedBy: 'a' });
      throw new Error('expected');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
  });

  it('soft delete', async () => {
    findById.mockResolvedValue(buildGeojsonFixture({ id }));
    softDelete.mockResolvedValue(
      buildGeojsonFixture({
        id,
        deletedBy: 'm',
        deletedAt: new Date('2026-03-03T00:00:00.000Z'),
      }),
    );
    await service.execute({ id, deletedBy: 'm' });
    expect(softDelete).toHaveBeenCalledWith(id, 'm');
  });
});
