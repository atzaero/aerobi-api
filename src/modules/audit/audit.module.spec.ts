import { MODULE_METADATA } from '@nestjs/common/constants';

import { AuditModule } from './audit.module';
import { ExportAuditLogsController } from './controllers/export-audit-logs.controller';
import { FindAuditLogByIdController } from './controllers/find-audit-log-by-id.controller';

/**
 * Em Express 5 (path-to-regexp 8) não há regex inline no param de rota, então a
 * precedência de `GET /audit-logs/export` sobre `/:id` depende da ordem de
 * registro dos controllers no módulo. Este teste trava a invariante: se alguém
 * reordenar o array (alfabetizar imports, scaffold, merge) e o `/:id` passar à
 * frente, `GET /audit-logs/export` cairia no handler de busca por id
 * (`400 'id must be a UUID'`). Falhar aqui evita a regressão sem precisar de e2e.
 */
describe('AuditModule — precedência de rotas /export vs /:id', () => {
  it('registra ExportAuditLogsController antes de FindAuditLogByIdController', () => {
    const controllers = Reflect.getMetadata(
      MODULE_METADATA.CONTROLLERS,
      AuditModule,
    ) as unknown[];

    const exportIdx = controllers.indexOf(ExportAuditLogsController);
    const findByIdIdx = controllers.indexOf(FindAuditLogByIdController);

    expect(exportIdx).toBeGreaterThanOrEqual(0);
    expect(findByIdIdx).toBeGreaterThanOrEqual(0);
    expect(exportIdx).toBeLessThan(findByIdIdx);
  });
});
