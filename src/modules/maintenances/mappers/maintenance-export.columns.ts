import type { MaintenanceTask } from '@/generated/prisma/client';

import type { CsvColumn } from '@/common/utils/csv.util';

import { formatMaintenanceDisplayName } from '../utils/maintenance-domain.util';

/** Linha enriquecida para export CSV (UF via aeródromo/grupo). */
export interface MaintenanceExportRow {
  name: string;
  aerodromeId: string;
  uf: string;
  authorizedEmails: string[];
  createdAt: Date | null;
}

/** Colunas do export CSV de `/maintenances` (Intervenções). */
export const maintenanceExportColumns: CsvColumn<MaintenanceExportRow>[] = [
  {
    header: 'Nome da intervenção',
    accessor: (m) => formatMaintenanceDisplayName(m.name),
  },
  { header: 'Aeródromo (ID)', accessor: (m) => m.aerodromeId },
  { header: 'UF', accessor: (m) => m.uf },
  {
    header: 'E-mails autorizados',
    accessor: (m) => m.authorizedEmails.join('; '),
  },
  {
    header: 'Criado em (UTC)',
    accessor: (m) => (m.createdAt != null ? m.createdAt.toISOString() : ''),
  },
];

/** Converte `Decimal` Prisma em número finito para agregações. */
export function decimalToNumber(
  value:
    | MaintenanceTask['predictedValue']
    | MaintenanceTask['actualCost']
    | null
    | undefined,
): number {
  if (value == null) return 0;
  const n = value.toNumber();
  return Number.isFinite(n) ? n : 0;
}
