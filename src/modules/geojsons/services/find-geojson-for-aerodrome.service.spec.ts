import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import {
  GeojsonMapFileType,
  GeojsonStatus,
  Uf,
} from '@/generated/prisma/client';

import type {
  GeojsonRepository,
  GeojsonWithAerodrome,
} from '../repositories/geojson.repository';
import { buildGeojsonFixture } from '../testing/geojson.entity.fixture';

import { FindGeojsonForAerodromeService } from './find-geojson-for-aerodrome.service';

const aerodromeId = '22222222-2222-4222-8222-222222222222';

function buildWithAerodrome(
  overrides: Partial<GeojsonWithAerodrome> = {},
): GeojsonWithAerodrome {
  return {
    ...buildGeojsonFixture({
      aerodromeId,
      status: GeojsonStatus.READY,
      mapFileType: GeojsonMapFileType.KMZ,
      geoJson: { type: 'FeatureCollection', features: [] },
    }),
    aerodrome: { icao: 'sbsp', groupId: 'grp-1', group: { uf: Uf.SP } },
    ...overrides,
  } as GeojsonWithAerodrome;
}

describe('FindGeojsonForAerodromeService', () => {
  let service: FindGeojsonForAerodromeService;
  let findActiveByAerodromeId: jest.Mock;

  beforeEach(() => {
    findActiveByAerodromeId = jest.fn();
    service = new FindGeojsonForAerodromeService(
      { findActiveByAerodromeId } as unknown as GeojsonRepository,
      new ErrorMessageService(),
    );
  });

  it('READY: deriva icao/stateId/groupId e expõe enums lowercase + geoJson objeto', async () => {
    findActiveByAerodromeId.mockResolvedValue(buildWithAerodrome());
    const out = await service.execute({ aerodromeId });
    expect(out).toMatchObject({
      docId: aerodromeId,
      icao: 'SBSP',
      stateId: 'SP',
      groupId: 'grp-1',
      kind: 'aerodrome_map',
      mapFileType: 'kmz',
    });
    expect(out.geoJson).toEqual({ type: 'FeatureCollection', features: [] });
    expect(typeof out.generatedAt).toBe('string');
  });

  it('inexistente/soft-deletado → 404', async () => {
    findActiveByAerodromeId.mockResolvedValue(null);
    try {
      await service.execute({ aerodromeId });
      throw new Error('expected');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
  });

  it('status ≠ READY → 422 GEOJSON_NOT_READY', async () => {
    findActiveByAerodromeId.mockResolvedValue(
      buildWithAerodrome({ status: GeojsonStatus.ERROR }),
    );
    try {
      await service.execute({ aerodromeId });
      throw new Error('expected');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.GEOJSON_NOT_READY,
      );
      expect((e as CustomHttpException).getStatus()).toBe(422);
    }
  });

  it('geoJson ausente/inválido → 502 GEOJSON_READ_FAILED', async () => {
    findActiveByAerodromeId.mockResolvedValue(
      buildWithAerodrome({ geoJson: null }),
    );
    try {
      await service.execute({ aerodromeId });
      throw new Error('expected');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.GEOJSON_READ_FAILED,
      );
      expect((e as CustomHttpException).getStatus()).toBe(502);
    }
  });
});
