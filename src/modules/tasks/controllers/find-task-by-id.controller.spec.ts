import type { TaskParamDTO } from '../dtos/task-param.dto';
import type { FindTaskByIdService } from '../services/find-task-by-id.service';

import { FindTaskByIdController } from './find-task-by-id.controller';

describe('FindTaskByIdController', () => {
  let controller: FindTaskByIdController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new FindTaskByIdController({
      execute,
    } as unknown as FindTaskByIdService);
  });

  it('delega o id do parâmetro ao service', async () => {
    const params: TaskParamDTO = {
      id: '11111111-1111-4111-8111-111111111111',
    };
    const row = { id: params.id };
    execute.mockResolvedValue(row);

    await expect(controller.handle(params)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith(params.id);
  });
});
