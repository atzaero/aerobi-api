import { Module } from '@nestjs/common';

import { EmailModule } from '@/common/email/email.module';
import { InMemoryIpRateLimiterService } from '@/common/services/in-memory-ip-rate-limiter.service';
import { AuditModule } from '@/modules/audit/audit.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { UsersModule } from '@/modules/users/users.module';

import { PublicMaintenanceRateLimitGuard } from './guards/public-maintenance-rate-limit.guard';

import { CreateMaintenanceController } from './controllers/create-maintenance.controller';
import { ExportMaintenancesController } from './controllers/export-maintenances.controller';
import { FindMaintenanceByIdController } from './controllers/find-maintenance-by-id.controller';
import { ListMaintenancesController } from './controllers/list-maintenances.controller';
import { CreatePublicMaintenanceGuessController } from './controllers/public/create-public-maintenance-guess.controller';
import { GetPublicMaintenanceFeedbackController } from './controllers/public/get-public-maintenance-feedback.controller';
import { RemoveMaintenanceController } from './controllers/remove-maintenance.controller';
import { ResendMaintenanceInvitationsController } from './controllers/resend-maintenance-invitations.controller';
import { StatsMaintenancesController } from './controllers/stats-maintenances.controller';
import { UpdateMaintenanceController } from './controllers/update-maintenance.controller';

import { MaintenanceInvitationEmailListener } from './listeners/maintenance-invitation-email.listener';
import { MaintenancesSharedModule } from './maintenances-shared.module';

import { CreateMaintenanceService } from './services/create-maintenance.service';
import { CreatePublicMaintenanceGuessService } from './services/create-public-maintenance-guess.service';
import { ExportMaintenancesService } from './services/export-maintenances.service';
import { FindMaintenanceByIdService } from './services/find-maintenance-by-id.service';
import { GetPublicMaintenanceFeedbackService } from './services/get-public-maintenance-feedback.service';
import { ListMaintenancesService } from './services/list-maintenances.service';
import { MaintenanceInvitationMailerService } from './services/maintenance-invitation-mailer.service';
import { RemoveMaintenanceService } from './services/remove-maintenance.service';
import { ResendMaintenanceInvitationsService } from './services/resend-maintenance-invitations.service';
import { StatsMaintenancesService } from './services/stats-maintenances.service';
import { UpdateMaintenanceService } from './services/update-maintenance.service';

/**
 * Intervenções de manutenção (admin/coordinator). Tarefas ficam em `TasksModule`;
 * convites por e-mail via evento assíncrono (`MaintenanceInvitedEvent`).
 */
@Module({
  imports: [
    MaintenancesSharedModule,
    AuthModule,
    UsersModule,
    AuditModule,
    EmailModule,
  ],
  controllers: [
    GetPublicMaintenanceFeedbackController,
    CreatePublicMaintenanceGuessController,
    CreateMaintenanceController,
    /**
     * `/export` e `/stats` devem preceder `/:id` (Express 5): senão caem no
     * handler de busca por id. Invariante travada em `maintenances.module.spec.ts`.
     */
    ExportMaintenancesController,
    StatsMaintenancesController,
    ListMaintenancesController,
    ResendMaintenanceInvitationsController,
    FindMaintenanceByIdController,
    UpdateMaintenanceController,
    RemoveMaintenanceController,
  ],
  providers: [
    CreateMaintenanceService,
    UpdateMaintenanceService,
    ListMaintenancesService,
    FindMaintenanceByIdService,
    RemoveMaintenanceService,
    ExportMaintenancesService,
    StatsMaintenancesService,
    ResendMaintenanceInvitationsService,
    MaintenanceInvitationMailerService,
    MaintenanceInvitationEmailListener,
    GetPublicMaintenanceFeedbackService,
    CreatePublicMaintenanceGuessService,
    InMemoryIpRateLimiterService,
    PublicMaintenanceRateLimitGuard,
  ],
})
export class MaintenancesModule {}
