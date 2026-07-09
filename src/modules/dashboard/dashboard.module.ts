import { Module } from '@nestjs/common';

import { AerodromesModule } from '@/modules/aerodromes/aerodromes.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { FeedbacksModule } from '@/modules/feedbacks/feedbacks.module';
import { LandingRequestsModule } from '@/modules/landing-requests/landing-requests.module';
import { MaintenancesSharedModule } from '@/modules/maintenances/maintenances-shared.module';
import { TechnicalVisitsModule } from '@/modules/technical-visits/technical-visits.module';
import { UsersModule } from '@/modules/users/users.module';

import { GetDashboardController } from './controllers/get-dashboard.controller';
import { BuildAdminDashboardService } from './services/builders/build-admin-dashboard.service';
import { BuildOperatorDashboardService } from './services/builders/build-operator-dashboard.service';
import { BuildTechnicalDashboardService } from './services/builders/build-technical-dashboard.service';
import { GetDashboardService } from './services/get-dashboard.service';
import { AerodromesStatsService } from './services/stats/aerodromes.stats.service';
import { FeedbacksStatsService } from './services/stats/feedbacks.stats.service';
import { LandingRequestsStatsService } from './services/stats/landing-requests.stats.service';
import { TasksStatsService } from './services/stats/tasks.stats.service';
import { TechnicalVisitsStatsService } from './services/stats/technical-visits.stats.service';

/**
 * Dashboard **read-only/agregação** por papel. Não tem tabela nem `PrismaService`
 * próprio: consome os repositórios exportados pelos módulos de origem
 * (aerodromes/landing-requests/technical-visits/feedbacks/tasks) e resolve escopo
 * via `AuthModule` + `UsersModule`. `GetDashboardService` despacha ao builder do
 * papel (admin/coordinator → admin; operator; technical).
 */
@Module({
  imports: [
    AuthModule,
    UsersModule,
    AerodromesModule,
    LandingRequestsModule,
    TechnicalVisitsModule,
    FeedbacksModule,
    MaintenancesSharedModule,
  ],
  controllers: [GetDashboardController],
  providers: [
    GetDashboardService,
    BuildAdminDashboardService,
    BuildOperatorDashboardService,
    BuildTechnicalDashboardService,
    LandingRequestsStatsService,
    TechnicalVisitsStatsService,
    AerodromesStatsService,
    FeedbacksStatsService,
    TasksStatsService,
  ],
})
export class DashboardModule {}
