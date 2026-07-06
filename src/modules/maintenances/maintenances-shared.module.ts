import { Module } from '@nestjs/common';

import { PrismaModule } from '@/prisma/prisma.module';

import { MaintenanceGuessRepository } from '@/modules/guesses/repositories/maintenance-guess.repository';

import { MaintenanceRepository } from './repositories/maintenance.repository';
import { MaintenanceTaskRepository } from '@/modules/tasks/repositories/maintenance-task.repository';

/**
 * Repositórios partilhados entre `MaintenancesModule`, `TasksModule` e
 * `GuessesModule`, evitando dependência circular via `forwardRef`.
 */
@Module({
  imports: [PrismaModule],
  providers: [
    MaintenanceRepository,
    MaintenanceTaskRepository,
    MaintenanceGuessRepository,
  ],
  exports: [
    MaintenanceRepository,
    MaintenanceTaskRepository,
    MaintenanceGuessRepository,
  ],
})
export class MaintenancesSharedModule {}
