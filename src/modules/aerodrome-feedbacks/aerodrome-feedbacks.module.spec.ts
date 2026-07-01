import { MODULE_METADATA } from '@nestjs/common/constants';

import { AerodromeFeedbacksModule } from './aerodrome-feedbacks.module';
import { ExportAerodromeFeedbacksController } from './controllers/export-aerodrome-feedbacks.controller';
import { FindAerodromeFeedbackByIdController } from './controllers/find-aerodrome-feedback-by-id.controller';
import { SummaryAerodromeFeedbacksController } from './controllers/summary-aerodrome-feedbacks.controller';

/**
 * Em Express 5 (path-to-regexp 8) não há regex inline no param de rota, então a
 * precedência de `GET /aerodrome-feedbacks/summary` e `/export` sobre `/:id`
 * depende da ordem de registro dos controllers no módulo. Este teste trava a
 * invariante: se alguém reordenar o array e o `/:id` passar à frente, `summary`
 * (ou `export`) cairia no handler de busca por id (`422 'id must be a UUID'`).
 */
describe('AerodromeFeedbacksModule — precedência de rotas fixas vs /:id', () => {
  const controllers = Reflect.getMetadata(
    MODULE_METADATA.CONTROLLERS,
    AerodromeFeedbacksModule,
  ) as unknown[];

  const findByIdIdx = controllers.indexOf(FindAerodromeFeedbackByIdController);

  it.each([
    ['summary', SummaryAerodromeFeedbacksController],
    ['export', ExportAerodromeFeedbacksController],
  ])(
    'registra %s antes de FindAerodromeFeedbackByIdController',
    (_name, ctrl) => {
      const idx = controllers.indexOf(ctrl);
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(findByIdIdx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(findByIdIdx);
    },
  );
});
