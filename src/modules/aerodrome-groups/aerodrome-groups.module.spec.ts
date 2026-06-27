import { MODULE_METADATA } from '@nestjs/common/constants';

import { AerodromeGroupsModule } from './aerodrome-groups.module';
import { ExportAerodromeGroupsController } from './controllers/export-aerodrome-groups.controller';
import { FindAerodromeGroupByIdController } from './controllers/find-aerodrome-group-by-id.controller';

/**
 * Em Express 5 (path-to-regexp 8) não há regex inline no param de rota, então a
 * precedência de `GET /aerodrome-groups/export` sobre `/:id` depende da ordem de
 * registro dos controllers no módulo. Este teste trava a invariante: se alguém
 * reordenar o array (alfabetizar imports, scaffold, merge) e o `/:id` passar à
 * frente, `GET /aerodrome-groups/export` cairia no handler de busca por id
 * (`400 'id must be a UUID'`). Falhar aqui evita a regressão sem precisar de e2e.
 */
describe('AerodromeGroupsModule — precedência de rotas /export vs /:id', () => {
  it('registra ExportAerodromeGroupsController antes de FindAerodromeGroupByIdController', () => {
    const controllers = Reflect.getMetadata(
      MODULE_METADATA.CONTROLLERS,
      AerodromeGroupsModule,
    ) as unknown[];

    const exportIdx = controllers.indexOf(ExportAerodromeGroupsController);
    const findByIdIdx = controllers.indexOf(FindAerodromeGroupByIdController);

    expect(exportIdx).toBeGreaterThanOrEqual(0);
    expect(findByIdIdx).toBeGreaterThanOrEqual(0);
    expect(exportIdx).toBeLessThan(findByIdIdx);
  });
});
