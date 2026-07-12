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

import { ListVisibleGeojsonsService } from './list-visible-geojsons.service';

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
      sourceStoragePath: 'geojsons/secret/source.kmz',
      createdBy: 'actor-1',
      errorMessage: 'internal',
    }),
    aerodrome: { icao: 'sbsp', groupId: 'grp-1', group: { uf: Uf.SP } },
    ...overrides,
  };
}

describe('ListVisibleGeojsonsService', () => {
  let service: ListVisibleGeojsonsService;
  let findAllActiveVisible: jest.Mock;

  beforeEach(() => {
    findAllActiveVisible = jest.fn();
    service = new ListVisibleGeojsonsService({
      findAllActiveVisible,
    } as unknown as GeojsonRepository);
  });

  it('projeta READY parseáveis no DTO público (sem campos admin)', async () => {
    findAllActiveVisible.mockResolvedValue([buildWithAerodrome()]);

    const out = await service.execute();

    expect(findAllActiveVisible).toHaveBeenCalledWith();
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      docId: aerodromeId,
      icao: 'SBSP',
      stateId: 'SP',
      groupId: 'grp-1',
      kind: 'aerodrome_map',
      mapFileType: 'kmz',
    });
    expect(out[0].geoJson).toEqual({ type: 'FeatureCollection', features: [] });
    expect(out[0]).not.toHaveProperty('sourceStoragePath');
    expect(out[0]).not.toHaveProperty('createdBy');
    expect(out[0]).not.toHaveProperty('errorMessage');
    expect(out[0]).not.toHaveProperty('status');
  });

  it('omite itens com geoJson inválido e retorna array vazio quando nenhum serve', async () => {
    findAllActiveVisible.mockResolvedValue([
      buildWithAerodrome({ geoJson: null }),
      buildWithAerodrome({ geoJson: 'not-json' as never }),
    ]);

    await expect(service.execute()).resolves.toEqual([]);
  });

  it('lista vazia do repo → array vazio', async () => {
    findAllActiveVisible.mockResolvedValue([]);
    await expect(service.execute()).resolves.toEqual([]);
  });
});
