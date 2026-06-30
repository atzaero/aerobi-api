import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { AerodromeGeojsonStatus } from '@/generated/prisma/client';

import { patchAerodromeGeojsonToPrisma } from '../mappers/aerodrome-geojson.prisma.mapper';
import type { AerodromeGeojsonRepository } from '../repositories/aerodrome-geojson.repository';
import { buildAerodromeGeojsonFixture } from '../testing/aerodrome-geojson.entity.fixture';

import { UpdateAerodromeGeojsonService } from './update-aerodrome-geojson.service';

describe('UpdateAerodromeGeojsonService', () => {
  let service: UpdateAerodromeGeojsonService;
  let findById: jest.Mock;
  let update: jest.Mock;

  beforeEach(() => {
    findById = jest.fn();
    update = jest.fn();
    const repo = { findById, update } as unknown as AerodromeGeojsonRepository;
    service = new UpdateAerodromeGeojsonService(
      repo,
      new ErrorMessageService(),
    );
  });

  const id = '11111111-1111-4111-8111-111111111111';
  const newAid = '33333333-3333-4333-8333-333333333333';

  it('404', async () => {
    findById.mockResolvedValue(null);
    try {
      await service.execute({ id, status: AerodromeGeojsonStatus.ERROR });
      throw new Error('expected');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
    expect(update).not.toHaveBeenCalled();
  });

  it('patch status', async () => {
    findById.mockResolvedValue(buildAerodromeGeojsonFixture({ id }));
    update.mockResolvedValue(
      buildAerodromeGeojsonFixture({
        id,
        status: AerodromeGeojsonStatus.ERROR,
      }),
    );
    await service.execute({ id, status: AerodromeGeojsonStatus.ERROR });
    expect(update).toHaveBeenCalledWith(
      id,
      patchAerodromeGeojsonToPrisma({
        status: AerodromeGeojsonStatus.ERROR,
      }),
    );
  });

  it('aerodromeId com connect', async () => {
    findById.mockResolvedValue(buildAerodromeGeojsonFixture({ id }));
    update.mockResolvedValue(
      buildAerodromeGeojsonFixture({
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
