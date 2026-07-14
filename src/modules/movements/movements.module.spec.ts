import { MODULE_METADATA } from '@nestjs/common/constants';

import { ExportMovementsController } from './controllers/export-movements.controller';
import { FindMovementByIdCanonicalController } from './controllers/find-movement-by-id-canonical.controller';
import { MovementsModule } from './movements.module';

/**
 * Em Express 5 a precedência de rotas fixas sobre `/:id` depende da ordem de
 * registro dos controllers. Este teste trava a invariante: `GET /movements/export`
 * tem de ser registrado antes de `GET /movements/:movementId`, senão `export`
 * casaria como um `movementId`.
 */
describe('MovementsModule — precedência de rotas fixas vs /:movementId', () => {
  const controllers = Reflect.getMetadata(
    MODULE_METADATA.CONTROLLERS,
    MovementsModule,
  ) as unknown[];

  it('registra ExportMovementsController antes de FindMovementByIdCanonicalController', () => {
    const exportIdx = controllers.indexOf(ExportMovementsController);
    const findByIdIdx = controllers.indexOf(
      FindMovementByIdCanonicalController,
    );

    expect(exportIdx).toBeGreaterThanOrEqual(0);
    expect(findByIdIdx).toBeGreaterThanOrEqual(0);
    expect(exportIdx).toBeLessThan(findByIdIdx);
  });
});
