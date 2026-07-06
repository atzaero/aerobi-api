import { Module } from '@nestjs/common';

import { AuditModule } from '@/modules/audit/audit.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { MaintenancesSharedModule } from '@/modules/maintenances/maintenances-shared.module';

import { CreateTaskController } from './controllers/create-task.controller';
import { FindTaskByIdController } from './controllers/find-task-by-id.controller';
import { ListTasksController } from './controllers/list-tasks.controller';
import { RemoveTaskController } from './controllers/remove-task.controller';
import { UpdateTaskController } from './controllers/update-task.controller';

import { CreateTaskService } from './services/create-task.service';
import { FindTaskByIdService } from './services/find-task-by-id.service';
import { ListTasksService } from './services/list-tasks.service';
import { RemoveTaskService } from './services/remove-task.service';
import { UpdateTaskService } from './services/update-task.service';

/**
 * Tarefas de intervenções de manutenção. Coleção em `POST/GET /tasks` (com
 * `maintenanceId` no body/query); item em `GET/PATCH/DELETE /tasks/:id`.
 */
@Module({
  imports: [MaintenancesSharedModule, AuthModule, AuditModule],
  controllers: [
    /**
     * `GET /tasks` (query) deve preceder `GET /tasks/:id` — invariante em
     * `tasks.module.spec.ts`.
     */
    ListTasksController,
    CreateTaskController,
    FindTaskByIdController,
    UpdateTaskController,
    RemoveTaskController,
  ],
  providers: [
    CreateTaskService,
    ListTasksService,
    FindTaskByIdService,
    UpdateTaskService,
    RemoveTaskService,
  ],
})
export class TasksModule {}
