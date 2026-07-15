import { Module } from '@nestjs/common';

import { AuditModule } from '@/modules/audit/audit.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { MaintenancesSharedModule } from '@/modules/maintenances/maintenances-shared.module';

import { ListTaskGuessesController } from './controllers/list-task-guesses.controller';
import { RemoveGuessController } from './controllers/remove-guess.controller';
import { UpdateGuessStatusController } from './controllers/update-guess-status.controller';

import { ListTaskGuessesService } from './services/list-task-guesses.service';
import { RemoveGuessService } from './services/remove-guess.service';
import { UpdateGuessStatusService } from './services/update-guess-status.service';

/**
 * Moderação de palpites (`guesses`) de tarefas de manutenção. Rotas públicas de
 * envio ficam em `MaintenancesModule` (`/public/maintenances/...`).
 */
@Module({
  imports: [MaintenancesSharedModule, AuthModule, AuditModule],
  controllers: [
    ListTaskGuessesController,
    UpdateGuessStatusController,
    RemoveGuessController,
  ],
  providers: [
    ListTaskGuessesService,
    UpdateGuessStatusService,
    RemoveGuessService,
  ],
})
export class GuessesModule {}
