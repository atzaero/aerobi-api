import type { CsvColumn } from '@/common/utils/csv.util';
import {
  LandingRequestStatus,
  type LandingRequest,
} from '@/generated/prisma/client';

/** Rótulos pt-BR do status para o CSV (espelha o web). */
const STATUS_LABELS: Record<LandingRequestStatus, string> = {
  [LandingRequestStatus.PENDING]: 'Pendente',
  [LandingRequestStatus.APPROVED]: 'Aprovada',
  [LandingRequestStatus.REJECTED]: 'Recusada',
};

/**
 * Colunas do export CSV de solicitações de pouso (8 colunas, na ordem do web).
 * **Não** exporta CPF (PII); o telefone/e-mail seguem para contato operacional.
 */
export const landingRequestExportColumns: readonly CsvColumn<LandingRequest>[] =
  [
    { header: 'Aeródromo (ID)', accessor: (row) => row.aerodromeId },
    {
      header: 'Status',
      accessor: (row) => STATUS_LABELS[row.status] ?? row.status,
    },
    { header: 'Piloto', accessor: (row) => row.pilotName ?? '' },
    { header: 'Aeronave', accessor: (row) => row.aircraftModel ?? '' },
    { header: 'Matrícula', accessor: (row) => row.aircraftRegistration ?? '' },
    { header: 'Telefone', accessor: (row) => row.phoneContact ?? '' },
    { header: 'E-mail', accessor: (row) => row.email ?? '' },
    {
      header: 'Criado em (UTC)',
      accessor: (row) => row.createdAt.toISOString(),
    },
  ];
