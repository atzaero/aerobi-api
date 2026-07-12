import { MODULE_METADATA } from '@nestjs/common/constants';

import { FindGeojsonByIdController } from './controllers/find-geojson-by-id.controller';
import { FindGeojsonForAerodromeController } from './controllers/find-geojson-for-aerodrome.controller';
import { FindVisibleGeojsonByAerodromeIdController } from './controllers/find-visible-geojson-by-aerodrome-id.controller';
import { GenerateGeojsonController } from './controllers/generate-geojson.controller';
import { ListVisibleGeojsonsController } from './controllers/list-visible-geojsons.controller';
import { GeojsonsModule } from './geojsons.module';

/**
 * Em Express 5 (path-to-regexp 8) não há regex inline no param de rota, então a
 * precedência das rotas fixas (`aerodrome/...`, `visible`, `visible/:aerodromeId`)
 * sobre `/:id` depende da ordem de registro dos controllers. Este teste trava a
 * invariante: se alguém reordenar o array e o `/:id` passar à frente, essas
 * rotas poderiam cair no handler de busca por id.
 */
describe('GeojsonsModule — precedência de rotas fixas vs /:id', () => {
  const controllers = Reflect.getMetadata(
    MODULE_METADATA.CONTROLLERS,
    GeojsonsModule,
  ) as unknown[];

  const findByIdIdx = controllers.indexOf(FindGeojsonByIdController);

  it.each([
    ['visible', ListVisibleGeojsonsController],
    ['visible/:aerodromeId', FindVisibleGeojsonByAerodromeIdController],
    ['aerodrome/:id', FindGeojsonForAerodromeController],
    ['aerodrome/:id/generate', GenerateGeojsonController],
  ])('registra %s antes de FindGeojsonByIdController', (_name, ctrl) => {
    const idx = controllers.indexOf(ctrl);
    expect(idx).toBeGreaterThanOrEqual(0);
    expect(findByIdIdx).toBeGreaterThanOrEqual(0);
    expect(idx).toBeLessThan(findByIdIdx);
  });
});
