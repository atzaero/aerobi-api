import { MODULE_METADATA } from '@nestjs/common/constants';

import { AerodromesModule } from '@/modules/aerodromes/aerodromes.module';
import { FeedbacksModule } from '@/modules/feedbacks/feedbacks.module';
import { LandingRequestsModule } from '@/modules/landing-requests/landing-requests.module';
import { MaintenancesSharedModule } from '@/modules/maintenances/maintenances-shared.module';
import { TechnicalVisitsModule } from '@/modules/technical-visits/technical-visits.module';

import { GetDashboardController } from './controllers/get-dashboard.controller';
import { DashboardModule } from './dashboard.module';
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
 * Trava a fiação do módulo: o dashboard depende dos módulos de origem exportarem
 * seus repositórios (e do `MaintenancesSharedModule` para tasks). Verifica a
 * metadata sem instanciar o container (evita puxar Prisma/Config nos unit tests).
 */
describe('DashboardModule', () => {
  const imports = Reflect.getMetadata(
    MODULE_METADATA.IMPORTS,
    DashboardModule,
  ) as unknown[];
  const controllers = Reflect.getMetadata(
    MODULE_METADATA.CONTROLLERS,
    DashboardModule,
  ) as unknown[];
  const providers = Reflect.getMetadata(
    MODULE_METADATA.PROVIDERS,
    DashboardModule,
  ) as unknown[];

  it('importa os módulos de origem que exportam os repositórios agregados', () => {
    expect(imports).toEqual(
      expect.arrayContaining([
        AerodromesModule,
        LandingRequestsModule,
        TechnicalVisitsModule,
        FeedbacksModule,
        MaintenancesSharedModule,
      ]),
    );
  });

  it('registra o controller do dashboard', () => {
    expect(controllers).toContain(GetDashboardController);
  });

  it('registra o service, os builders e os stats services', () => {
    expect(providers).toEqual(
      expect.arrayContaining([
        GetDashboardService,
        BuildAdminDashboardService,
        BuildOperatorDashboardService,
        BuildTechnicalDashboardService,
        LandingRequestsStatsService,
        TechnicalVisitsStatsService,
        AerodromesStatsService,
        FeedbacksStatsService,
        TasksStatsService,
      ]),
    );
  });
});
