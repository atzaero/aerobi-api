import type { CsvColumn } from '@/common/utils/csv.util';
import type { AuditLog } from '@/generated/prisma/client';

import {
  AUDIT_ACTION_LABELS_PT,
  AUDIT_ACTOR_ROLE_LABELS_PT,
  auditEntityTypeLabel,
} from './audit-labels';

/**
 * Colunas do export CSV de auditoria (espelha `export/columns.ts` do
 * `aerobi-web`), com cabeçalhos pt-BR e labels traduzidos (fallback ao valor
 * bruto). Não exporta `before`/`after`/`metadata`/`ip`/`userAgent` — só as 6
 * colunas do web. Data em ISO 8601 UTC.
 */
export const auditExportColumns: CsvColumn<AuditLog>[] = [
  {
    header: 'Data/Hora (UTC)',
    accessor: (log) => log.createdAt.toISOString(),
  },
  {
    header: 'Ação',
    accessor: (log) => AUDIT_ACTION_LABELS_PT[log.action] ?? log.action,
  },
  {
    header: 'Entidade',
    accessor: (log) => auditEntityTypeLabel(log.entityType),
  },
  { header: 'ID da entidade', accessor: (log) => log.entityId },
  { header: 'Ator (e-mail)', accessor: (log) => log.actorEmail ?? '' },
  {
    header: 'Papel do ator',
    accessor: (log) =>
      log.actorRole
        ? (AUDIT_ACTOR_ROLE_LABELS_PT[log.actorRole] ?? log.actorRole)
        : '',
  },
];
