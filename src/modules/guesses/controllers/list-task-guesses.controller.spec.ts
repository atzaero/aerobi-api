import type { ListTaskGuessesQueryDTO } from '../dtos/list-task-guesses-query.dto';
import type { TaskGuessesParamDTO } from '../dtos/task-guesses-param.dto';
import type { ListTaskGuessesService } from '../services/list-task-guesses.service';

import { ListTaskGuessesController } from './list-task-guesses.controller';

describe('ListTaskGuessesController', () => {
  let controller: ListTaskGuessesController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new ListTaskGuessesController({
      execute,
    } as unknown as ListTaskGuessesService);
  });

  it('delega taskId e query ao service e devolve o resultado', async () => {
    const params: TaskGuessesParamDTO = {
      taskId: '55555555-5555-4555-8555-555555555555',
    };
    const query: ListTaskGuessesQueryDTO = { status: 'considered' };
    const rows = [{ id: 'g1' }];
    execute.mockResolvedValue(rows);

    await expect(controller.handle(params, query)).resolves.toBe(rows);
    expect(execute).toHaveBeenCalledWith(params.taskId, query);
  });
});
