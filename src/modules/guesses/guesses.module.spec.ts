import { MODULE_METADATA } from '@nestjs/common/constants';

import { ListTaskGuessesController } from './controllers/list-task-guesses.controller';
import { GuessesModule } from './guesses.module';

/**
 * Em Express 5 a precedência de `GET /tasks/:taskId/guesses` sobre rotas mais
 * genéricas depende da ordem de registro dos controllers.
 */
describe('GuessesModule — precedência GET /tasks/:taskId/guesses', () => {
  const controllers = Reflect.getMetadata(
    MODULE_METADATA.CONTROLLERS,
    GuessesModule,
  ) as unknown[];

  const listIdx = controllers.indexOf(ListTaskGuessesController);

  it('registra ListTaskGuessesController no módulo', () => {
    expect(listIdx).toBeGreaterThanOrEqual(0);
  });
});
