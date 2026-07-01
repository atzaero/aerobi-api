import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { GeojsonStatus } from '@/generated/prisma/client';

import { patchGeojsonToPrisma } from '../mappers/geojson.prisma.mapper';
import type { GeojsonRepository } from '../repositories/geojson.repository';
import { buildGeojsonFixture } from '../testing/geojson.entity.fixture';

import { UpdateGeojsonService } from './update-geojson.service';

describe('UpdateGeojsonService', () => {
  let service: UpdateGeojsonService;
  let findById: jest.Mock;
  let update: jest.Mock;

  beforeEach(() => {
    findById = jest.fn();
    update = jest.fn();
    const repo = { findById, update } as unknown as GeojsonRepository;
    service = new UpdateGeojsonService(repo, new ErrorMessageService());
  });

  const id = '11111111-1111-4111-8111-111111111111';
  const newAid = '33333333-3333-4333-8333-333333333333';

  it('404', async () => {
    findById.mockResolvedValue(null);
    try {
      await service.execute({ id, status: GeojsonStatus.ERROR });
      throw new Error('expected');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
    expect(update).not.toHaveBeenCalled();
  });

  it('patch status', async () => {
    findById.mockResolvedValue(buildGeojsonFixture({ id }));
    update.mockResolvedValue(
      buildGeojsonFixture({
        id,
        status: GeojsonStatus.ERROR,
      }),
    );
    await service.execute({ id, status: GeojsonStatus.ERROR });
    expect(update).toHaveBeenCalledWith(
      id,
      patchGeojsonToPrisma({
        status: GeojsonStatus.ERROR,
      }),
    );
  });

  it('aerodromeId com connect', async () => {
    findById.mockResolvedValue(buildGeojsonFixture({ id }));
    update.mockResolvedValue(
      buildGeojsonFixture({
        id,
        aerodromeId: newAid,
      }),
    );
    await service.execute({
      id,
      aerodromeId: newAid,
      featureCount: 3,
    });
    expect(update).toHaveBeenCalledWith(
      id,
      expect.objectContaining({
        aerodrome: { connect: { id: newAid } },
        featureCount: 3,
      }),
    );
  });
});
