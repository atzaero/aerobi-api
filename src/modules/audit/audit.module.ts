import { Module } from '@nestjs/common';

import { AuthModule } from '@/modules/auth/auth.module';

import { ExportAuditLogsController } from './controllers/export-audit-logs.controller';
import { FindAuditLogByIdController } from './controllers/find-audit-log-by-id.controller';
import { ListAuditLogsController } from './controllers/list-audit-logs.controller';
import { AuditLogRepository } from './repositories/audit-log.repository';
import { AuditRecorderService } from './services/audit-recorder.service';
import { ExportAuditLogsService } from './services/export-audit-logs.service';
import { FindAuditLogByIdService } from './services/find-audit-log-by-id.service';
import { ListAuditLogsService } from './services/list-audit-logs.service';

/**
 * Módulo de auditoria (passo 2/13 da epic #353). Fundação transversal:
 * - **escrita** interna via `AuditRecorderService` (exportado, injetado nos
 *   módulos que fazem mutações — best-effort, nunca há rota HTTP de gravação);
 * - **leitura** (list/get-by-id/export) gated por RBAC (`audit`:list/read/export
 *   = ADMIN/COORDINATOR), **sem** escopo de grupo (paridade com o aerobi-web).
 *
 * Importa `AuthModule` para reusar `JwtAuthGuard`/`PermissionsGuard`.
 * `ExportAuditLogsController` vem antes de `FindAuditLogByIdController` para
 * `/audit-logs/export` não cair no handler `:id` (Express 5).
 */
@Module({
  imports: [AuthModule],
  controllers: [
    ListAuditLogsController,
    ExportAuditLogsController,
    FindAuditLogByIdController,
  ],
  providers: [
    AuditRecorderService,
    ListAuditLogsService,
    FindAuditLogByIdService,
    ExportAuditLogsService,
    AuditLogRepository,
  ],
  exports: [AuditRecorderService],
})
export class AuditModule {}
