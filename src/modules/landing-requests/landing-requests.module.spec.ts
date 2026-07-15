import { MODULE_METADATA } from '@nestjs/common/constants';

import { ExportLandingRequestsController } from './controllers/export-landing-requests.controller';
import { FindLandingRequestByIdController } from './controllers/find-landing-request-by-id.controller';
import { PendingCountLandingRequestsController } from './controllers/pending-count-landing-requests.controller';
import { LandingRequestsModule } from './landing-requests.module';

/**
 * Em Express 5 (path-to-regexp 8) não há regex inline no param de rota, então a
 * precedência de `GET /landing-requests/export` e `/pending-count` sobre `/:id`
 * depende da ordem de registro dos controllers no módulo. Este teste trava a
 * invariante: se alguém reordenar o array e o `/:id` passar à frente, `export`
 * (ou `pending-count`) cairia no handler de busca por id (`422 'id must be a
 * UUID'`).
 */
describe('LandingRequestsModule — precedência de rotas fixas vs /:id', () => {
  const controllers = Reflect.getMetadata(
    MODULE_METADATA.CONTROLLERS,
    LandingRequestsModule,
  ) as unknown[];

  const findByIdIdx = controllers.indexOf(FindLandingRequestByIdController);

  it.each([
    ['export', ExportLandingRequestsController],
    ['pending-count', PendingCountLandingRequestsController],
  ])('registra %s antes de FindLandingRequestByIdController', (_name, ctrl) => {
    const idx = controllers.indexOf(ctrl);
    expect(idx).toBeGreaterThanOrEqual(0);
    expect(findByIdIdx).toBeGreaterThanOrEqual(0);
    expect(idx).toBeLessThan(findByIdIdx);
  });
});
