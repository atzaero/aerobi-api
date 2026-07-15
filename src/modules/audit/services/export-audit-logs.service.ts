import { Injectable, Logger } from '@nestjs/common';

import { getErrorMessage } from '@/common/utils/error.util';
import { EXPORT_MAX_ROWS, toCsv } from '@/common/utils/csv.util';

import type { ExportAuditLogsQueryDto } from '../dtos/export-audit-logs-query.dto';
import { auditExportColumns } from '../mappers/audit-export.columns';
import { AuditLogRepository } from '../repositories/audit-log.repository';
import type { AuditLogFilters } from '../repositories/audit-log.repository.interface';

/**
 * Resultado do export: o CSV mais os sinais de truncamento expostos ao cliente
 * (`X-Export-Truncated`/`X-Export-Total`).
 */
export interface ExportAuditLogsResult {
  csv: string;
  truncated: boolean;
  total: number;
}

/**
 * Export CSV de auditoria (`GET /audit-logs/export`) — mesmos filtros da list,
 * sem paginação nem escopo de grupo (paridade com o web). Busca
 * `EXPORT_MAX_ROWS + 1` para detectar truncamento; ao exceder o teto, corta e
 * sinaliza ao cliente.
 */
@Injectable()
export class ExportAuditLogsService {
  private readonly logger = new Logger(ExportAuditLogsService.name);

  constructor(private readonly repository: AuditLogRepository) {}

  async execute(
    query: ExportAuditLogsQueryDto,
  ): Promise<ExportAuditLogsResult> {
    const filters: AuditLogFilters = {
      entityType: query.entityType,
      actorEmail: query.actorEmail,
      action: query.action,
      from: query.from !== undefined ? new Date(query.from) : undefined,
      to: query.to !== undefined ? new Date(query.to) : undefined,
    };

    const rows = await this.repository.findManyForExport(
      filters,
      EXPORT_MAX_ROWS + 1,
    );

    if (rows.length > EXPORT_MAX_ROWS) {
      let total = EXPORT_MAX_ROWS;
      try {
        total = Math.max(
          await this.repository.countForExport(filters),
          EXPORT_MAX_ROWS,
        );
      } catch (err) {
        this.logger.warn(
          `count do total truncado falhou (best-effort): ${getErrorMessage(err)}`,
        );
      }
      this.logger.warn(
        `Export de auditoria truncado em ${EXPORT_MAX_ROWS} de ${total} linhas.`,
      );
      return {
        csv: toCsv(rows.slice(0, EXPORT_MAX_ROWS), auditExportColumns),
        truncated: true,
        total,
      };
    }

    return {
      csv: toCsv(rows, auditExportColumns),
      truncated: false,
      total: rows.length,
    };
  }
}
