import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

import type { AerodromeGeojsonRepository } from '../repositories/aerodrome-geojson.repository';
import { buildAerodromeGeojsonFixture } from '../testing/aerodrome-geojson.entity.fixture';

import { FindAerodromeGeojsonByIdService } from './find-aerodrome-geojson-by-id.service';

describe('FindAerodromeGeojsonByIdService', () => {
  let service: FindAerodromeGeojsonByIdService;
  let findById: jest.Mock;

  beforeEach(() => {
    findById = jest.fn();
    const repo = { findById } as unknown as AerodromeGeojsonRepository;
    service = new FindAerodromeGeojsonByIdService(
      repo,
      new ErrorMessageService(),
    );
  });

  const id = '11111111-1111-4111-8111-111111111111';

  it('sucesso', async () => {
    findById.mockResolvedValue(buildAerodromeGeojsonFixture({ id }));
    await expect(service.execute({ id })).resolves.toMatchObject({ id });
  });

  it('404', async () => {
    findById.mockResolvedValue(null);
    try {
      await service.execute({ id });
      throw new Error('expected');
    } catch (e) {
      expect(e).toBeInstanceOf(CustomHttpException);
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
  });
});
