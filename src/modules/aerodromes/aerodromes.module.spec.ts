import { MODULE_METADATA } from '@nestjs/common/constants';

import { AerodromesModule } from './aerodromes.module';
import { ExportAerodromesController } from './controllers/export-aerodromes.controller';
import { FindAerodromeByIdController } from './controllers/find-aerodrome-by-id.controller';
import { FindVisibleAerodromeByIcaoController } from './controllers/find-visible-aerodrome-by-icao.controller';
import { ListVisibleAerodromesController } from './controllers/list-visible-aerodromes.controller';

/**
 * Em Express 5 (path-to-regexp 8) não há regex inline no param de rota, então a
 * precedência de `/export`, `/visible` e `/visible/:icao` sobre `/:id` depende
 * da ordem de registro dos controllers no módulo. Este teste trava a
 * invariante: se alguém reordenar o array e o `/:id` passar à frente, esses
 * paths cairiam no handler de busca por id. Falhar aqui evita a regressão sem
 * precisar de e2e.
 */
describe('AerodromesModule — precedência de rotas estáticas vs /:id', () => {
  it('registra /export, /visible e /visible/:icao antes de FindAerodromeByIdController', () => {
    const controllers = Reflect.getMetadata(
      MODULE_METADATA.CONTROLLERS,
      AerodromesModule,
    ) as unknown[];

    const exportIdx = controllers.indexOf(ExportAerodromesController);
    const listVisibleIdx = controllers.indexOf(ListVisibleAerodromesController);
    const findVisibleIdx = controllers.indexOf(
      FindVisibleAerodromeByIcaoController,
    );
    const findByIdIdx = controllers.indexOf(FindAerodromeByIdController);

    expect(exportIdx).toBeGreaterThanOrEqual(0);
    expect(listVisibleIdx).toBeGreaterThanOrEqual(0);
    expect(findVisibleIdx).toBeGreaterThanOrEqual(0);
    expect(findByIdIdx).toBeGreaterThanOrEqual(0);

    expect(exportIdx).toBeLessThan(findByIdIdx);
    expect(listVisibleIdx).toBeLessThan(findByIdIdx);
    expect(findVisibleIdx).toBeLessThan(findByIdIdx);
  });
});
