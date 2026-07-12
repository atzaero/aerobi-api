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

import { FindVisibleGeojsonByAerodromeIdService } from './find-visible-geojson-by-aerodrome-id.service';

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
  };
}

describe('FindVisibleGeojsonByAerodromeIdService', () => {
  let service: FindVisibleGeojsonByAerodromeIdService;
  let findActiveVisibleByAerodromeId: jest.Mock;

  beforeEach(() => {
    findActiveVisibleByAerodromeId = jest.fn();
    service = new FindVisibleGeojsonByAerodromeIdService(
      { findActiveVisibleByAerodromeId } as unknown as GeojsonRepository,
      new ErrorMessageService(),
    );
  });

  it('READY visível: DTO público com geoJson objeto', async () => {
    findActiveVisibleByAerodromeId.mockResolvedValue(buildWithAerodrome());
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
    expect(out).not.toHaveProperty('sourceStoragePath');
    expect(out).not.toHaveProperty('createdBy');
  });

  it('oculto/inexistente/soft-deletado → 404', async () => {
    findActiveVisibleByAerodromeId.mockResolvedValue(null);
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
    findActiveVisibleByAerodromeId.mockResolvedValue(
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
    findActiveVisibleByAerodromeId.mockResolvedValue(
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
