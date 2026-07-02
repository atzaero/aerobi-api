import type { CsvColumn } from '@/common/utils/csv.util';
import type { Contact } from '@/generated/prisma/client';

import {
  CONTACT_STATUS_LABELS,
  CONTACT_TYPE_LABELS,
} from '../utils/contact-labels.util';

/** Colunas do export CSV (espelha `aerobi-web` `export/columns.ts`). */
export const contactExportColumns: CsvColumn<Contact>[] = [
  { header: 'ID', accessor: (row) => row.id },
  { header: 'Nome', accessor: (row) => row.name },
  { header: 'E-mail', accessor: (row) => row.email },
  { header: 'Telefone', accessor: (row) => row.phone },
  {
    header: 'Tipo',
    accessor: (row) => CONTACT_TYPE_LABELS[row.type] ?? row.type,
  },
  {
    header: 'Status',
    accessor: (row) => CONTACT_STATUS_LABELS[row.status] ?? row.status,
  },
  { header: 'Mensagem', accessor: (row) => row.message },
  {
    header: 'Criado em (UTC)',
    accessor: (row) => row.createdAt.toISOString(),
  },
  {
    header: 'Atualizado em (UTC)',
    accessor: (row) => row.updatedAt.toISOString(),
  },
  { header: 'Atualizado por', accessor: (row) => row.updatedBy ?? '' },
];
