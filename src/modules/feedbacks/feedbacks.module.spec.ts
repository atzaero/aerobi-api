import { MODULE_METADATA } from '@nestjs/common/constants';

import { FeedbacksModule } from './feedbacks.module';
import { ExportFeedbacksController } from './controllers/export-feedbacks.controller';
import { FindFeedbackByIdController } from './controllers/find-feedback-by-id.controller';
import { SummaryFeedbacksController } from './controllers/summary-feedbacks.controller';

/**
 * Em Express 5 (path-to-regexp 8) não há regex inline no param de rota, então a
 * precedência de `GET /feedbacks/summary` e `/export` sobre `/:id`
 * depende da ordem de registro dos controllers no módulo. Este teste trava a
 * invariante: se alguém reordenar o array e o `/:id` passar à frente, `summary`
 * (ou `export`) cairia no handler de busca por id (`422 'id must be a UUID'`).
 */
describe('FeedbacksModule — precedência de rotas fixas vs /:id', () => {
  const controllers = Reflect.getMetadata(
    MODULE_METADATA.CONTROLLERS,
    FeedbacksModule,
  ) as unknown[];

  const findByIdIdx = controllers.indexOf(FindFeedbackByIdController);

  it.each([
    ['summary', SummaryFeedbacksController],
    ['export', ExportFeedbacksController],
  ])('registra %s antes de FindFeedbackByIdController', (_name, ctrl) => {
    const idx = controllers.indexOf(ctrl);
    expect(idx).toBeGreaterThanOrEqual(0);
    expect(findByIdIdx).toBeGreaterThanOrEqual(0);
    expect(idx).toBeLessThan(findByIdIdx);
  });
});
