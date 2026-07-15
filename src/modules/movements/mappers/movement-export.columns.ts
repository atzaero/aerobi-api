import type { CsvColumn } from '@/common/utils/csv.util';

import type { MovementWithSnapshot } from './movement.mapper';
import {
  formatConformityStatus,
  formatMovementSource,
  formatMovementType,
} from '../utils/movement-labels';

/**
 * Colunas do export CSV de `/movements`, espelhando o CSV do aerobi-web (mesmos
 * cabeçalhos e ordem). Diferente da lista enxuta (`GET /movements`), o export
 * projeta o **shape rico** direto da entidade — incluindo `readingStatus`,
 * `comments` e `createdAt`, que só existem no detalhe. Datas saem em ISO 8601
 * (UTC); `imageUrl` fica de fora (presigned expira em ~1h) e `confidence`
 * também (decisão de produto #235 / #725). Enums usam os rótulos pt-BR da UI.
 */
export const movementExportColumns: CsvColumn<MovementWithSnapshot>[] = [
  { header: 'Matrícula', accessor: (m) => m.registration },
  { header: 'Aeródromo', accessor: (m) => m.aerodrome ?? '' },
  {
    header: 'Data/hora da leitura',
    accessor: (m) => m.readingDatetime.toISOString(),
  },
  {
    header: 'Tipo de operação',
    accessor: (m) => formatMovementType(m.operationType),
  },
  { header: 'Origem', accessor: (m) => formatMovementSource(m.source) },
  {
    header: 'Conformidade',
    accessor: (m) => formatConformityStatus(m.conformityStatus),
  },
  { header: 'Status', accessor: (m) => m.readingStatus ?? '' },
  { header: 'Comentários', accessor: (m) => m.comments ?? '' },
  { header: 'Criado em', accessor: (m) => m.createdAt.toISOString() },
];
