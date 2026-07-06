import { MODULE_METADATA } from '@nestjs/common/constants';

import { FindTaskByIdController } from './controllers/find-task-by-id.controller';
import { ListTasksController } from './controllers/list-tasks.controller';
import { TasksModule } from './tasks.module';

/**
 * Em Express 5 a precedência de `GET /tasks` sobre `GET /tasks/:id` depende da
 * ordem de registro dos controllers.
 */
describe('TasksModule — precedência GET /tasks vs GET /tasks/:id', () => {
  const controllers = Reflect.getMetadata(
    MODULE_METADATA.CONTROLLERS,
    TasksModule,
  ) as unknown[];

  const listIdx = controllers.indexOf(ListTasksController);
  const findByIdIdx = controllers.indexOf(FindTaskByIdController);

  it('registra ListTasksController antes de FindTaskByIdController', () => {
    expect(listIdx).toBeGreaterThanOrEqual(0);
    expect(findByIdIdx).toBeGreaterThanOrEqual(0);
    expect(listIdx).toBeLessThan(findByIdIdx);
  });
});
