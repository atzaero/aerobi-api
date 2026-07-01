import { MODULE_METADATA } from '@nestjs/common/constants';

import { AerodromesModule } from './aerodromes.module';
import { ExportAerodromesController } from './controllers/export-aerodromes.controller';
import { FindAerodromeByIdController } from './controllers/find-aerodrome-by-id.controller';

/**
 * Em Express 5 (path-to-regexp 8) não há regex inline no param de rota, então a
 * precedência de `GET /aerodromes/export` sobre `/:id` depende da ordem de
 * registro dos controllers no módulo. Este teste trava a invariante: se alguém
 * reordenar o array (alfabetizar imports, scaffold, merge) e o `/:id` passar à
 * frente, `GET /aerodromes/export` cairia no handler de busca por id
 * (`400 'id must be a UUID'`). Falhar aqui evita a regressão sem precisar de e2e.
 */
describe('AerodromesModule — precedência de rotas /export vs /:id', () => {
  it('registra ExportAerodromesController antes de FindAerodromeByIdController', () => {
    const controllers = Reflect.getMetadata(
      MODULE_METADATA.CONTROLLERS,
      AerodromesModule,
    ) as unknown[];

    const exportIdx = controllers.indexOf(ExportAerodromesController);
    const findByIdIdx = controllers.indexOf(FindAerodromeByIdController);

    expect(exportIdx).toBeGreaterThanOrEqual(0);
    expect(findByIdIdx).toBeGreaterThanOrEqual(0);
    expect(exportIdx).toBeLessThan(findByIdIdx);
  });
});
