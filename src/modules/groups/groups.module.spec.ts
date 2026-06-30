import { MODULE_METADATA } from '@nestjs/common/constants';

import { GroupsModule } from './groups.module';
import { ExportGroupsController } from './controllers/export-groups.controller';
import { FindGroupByIdController } from './controllers/find-group-by-id.controller';

/**
 * Em Express 5 (path-to-regexp 8) não há regex inline no param de rota, então a
 * precedência de `GET /groups/export` sobre `/:id` depende da ordem de
 * registro dos controllers no módulo. Este teste trava a invariante: se alguém
 * reordenar o array (alfabetizar imports, scaffold, merge) e o `/:id` passar à
 * frente, `GET /groups/export` cairia no handler de busca por id
 * (`400 'id must be a UUID'`). Falhar aqui evita a regressão sem precisar de e2e.
 */
describe('GroupsModule — precedência de rotas /export vs /:id', () => {
  it('registra ExportGroupsController antes de FindGroupByIdController', () => {
    const controllers = Reflect.getMetadata(
      MODULE_METADATA.CONTROLLERS,
      GroupsModule,
    ) as unknown[];

    const exportIdx = controllers.indexOf(ExportGroupsController);
    const findByIdIdx = controllers.indexOf(FindGroupByIdController);

    expect(exportIdx).toBeGreaterThanOrEqual(0);
    expect(findByIdIdx).toBeGreaterThanOrEqual(0);
    expect(exportIdx).toBeLessThan(findByIdIdx);
  });
});
