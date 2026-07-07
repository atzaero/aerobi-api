import type { ListTasksQueryDTO } from '../dtos/list-tasks-query.dto';
import type { ListTasksService } from '../services/list-tasks.service';

import { ListTasksController } from './list-tasks.controller';

describe('ListTasksController', () => {
  let controller: ListTasksController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new ListTasksController({
      execute,
    } as unknown as ListTasksService);
  });

  it('delega a query de listagem ao service', async () => {
    const query = {
      maintenanceId: '11111111-1111-4111-8111-111111111111',
    } as ListTasksQueryDTO;
    const page = { data: [], meta: {} };
    execute.mockResolvedValue(page);

    await expect(controller.handle(query)).resolves.toBe(page);
    expect(execute).toHaveBeenCalledWith(query);
  });
});
