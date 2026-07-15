import type { Document } from '@/generated/prisma/client';
import type { CsvColumn } from '@/common/utils/csv.util';

import { DOCUMENT_TYPE_LABELS } from '../utils/document-type';

/** Linha do export = documento + a URL presigned pré-resolvida pelo service. */
export interface DocumentExportRow extends Document {
  url: string | null;
}

/**
 * Colunas do export CSV de documentos, na ordem do web
 * (`export/columns.ts`): Aeródromo (ID), Tipo (label pt-BR), Arquivo, Tamanho
 * (bytes), URL (presigned), Criado em (UTC · ISO 8601).
 */
export const documentExportColumns: CsvColumn<DocumentExportRow>[] = [
  { header: 'Aeródromo (ID)', accessor: (d) => d.aerodromeId },
  { header: 'Tipo', accessor: (d) => DOCUMENT_TYPE_LABELS[d.type] ?? d.type },
  { header: 'Arquivo', accessor: (d) => d.originalFilename },
  { header: 'Tamanho (bytes)', accessor: (d) => d.sizeBytes },
  { header: 'URL', accessor: (d) => d.url },
  { header: 'Criado em (UTC)', accessor: (d) => d.createdAt.toISOString() },
];
