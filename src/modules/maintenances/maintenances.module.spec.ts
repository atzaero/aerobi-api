import { MODULE_METADATA } from '@nestjs/common/constants';

import { ExportMaintenancesController } from './controllers/export-maintenances.controller';
import { FindMaintenanceByIdController } from './controllers/find-maintenance-by-id.controller';
import { ResendMaintenanceInvitationsController } from './controllers/resend-maintenance-invitations.controller';
import { StatsMaintenancesController } from './controllers/stats-maintenances.controller';
import { MaintenancesModule } from './maintenances.module';

/**
 * Em Express 5 a precedência de rotas fixas sobre `/:id` depende da ordem de
 * registro dos controllers. Este teste trava a invariante do módulo.
 */
describe('MaintenancesModule — precedência de rotas fixas vs /:id', () => {
  const controllers = Reflect.getMetadata(
    MODULE_METADATA.CONTROLLERS,
    MaintenancesModule,
  ) as unknown[];

  const findByIdIdx = controllers.indexOf(FindMaintenanceByIdController);
  const resendIdx = controllers.indexOf(ResendMaintenanceInvitationsController);

  it.each([
    ['export', ExportMaintenancesController],
    ['stats', StatsMaintenancesController],
  ])('registra %s antes de FindMaintenanceByIdController', (_name, ctrl) => {
    const idx = controllers.indexOf(ctrl);
    expect(idx).toBeGreaterThanOrEqual(0);
    expect(findByIdIdx).toBeGreaterThanOrEqual(0);
    expect(idx).toBeLessThan(findByIdIdx);
  });

  it('registra resend-invitations antes de FindMaintenanceByIdController', () => {
    expect(resendIdx).toBeGreaterThanOrEqual(0);
    expect(resendIdx).toBeLessThan(findByIdIdx);
  });
});
