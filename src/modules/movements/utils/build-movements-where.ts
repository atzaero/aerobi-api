import type { Prisma } from '@/generated/prisma/client';
import type {
  ConformityStatus,
  MovementSource,
  MovementType,
} from '@/generated/prisma/enums';
import { normalizeMarcas } from '@/modules/rab/utils/normalize-marcas';

/**
 * Filtros de consulta de movimentos compartilhados pela listagem
 * (`GET /movements`) e pelo export CSV (`GET /movements/export`). Nomes em
 * snake_case espelham os campos do DTO de query.
 */
export interface MovementWhereFilters {
  registration?: string;
  aerodrome?: string;
  reading_status?: string;
  operation_type?: MovementType;
  source?: MovementSource;
  conformity_status?: ConformityStatus;
  start_date?: string;
  end_date?: string;
}

/**
 * Builder puro do `where` do Prisma a partir dos filtros de movimentos —
 * fonte única de verdade dos filtros, reusada pela lista e pelo export. Não
 * aplica o filtro de soft-delete (`deletedAt`), que o repositório injeta.
 * `registration` é normalizado para a forma canônica (sem hífen), casando o
 * valor digitado ("PR-ZTT") com o formato persistido; o intervalo de datas usa
 * os limites do dia em UTC (início inclusivo, fim inclusivo).
 */
export function buildMovementsWhere(
  filters: MovementWhereFilters,
): Prisma.MovementWhereInput {
  const where: Prisma.MovementWhereInput = {};

  if (filters.registration) {
    where.registration = normalizeMarcas(filters.registration);
  }
  if (filters.aerodrome) {
    where.aerodrome = filters.aerodrome;
  }
  if (filters.reading_status) {
    where.readingStatus = filters.reading_status;
  }
  if (filters.operation_type) {
    where.operationType = filters.operation_type;
  }
  if (filters.source) {
    where.source = filters.source;
  }
  if (filters.conformity_status) {
    where.conformityStatus = filters.conformity_status;
  }
  if (filters.start_date || filters.end_date) {
    const readingDatetime: Prisma.DateTimeFilter = {};
    if (filters.start_date) {
      readingDatetime.gte = new Date(`${filters.start_date}T00:00:00.000Z`);
    }
    if (filters.end_date) {
      readingDatetime.lte = new Date(`${filters.end_date}T23:59:59.999Z`);
    }
    where.readingDatetime = readingDatetime;
  }

  return where;
}

/**
 * `where` da lista/export **com escopo por grupo** aplicado sobre o conjunto de
 * ICAOs visíveis ao ator (resolvido em `MovementScopeService`):
 *  - `scopedIcaos === null` → sem restrição de aeródromo (ADMIN);
 *  - `scopedIcaos` (array) → restringe a `aerodrome IN (icaos)` — combinado com
 *    um eventual filtro `aerodrome` específico via `AND`. Array vazio (coordinator
 *    sem grupo) resolve para `{ in: [] }`, que não casa nada (**fail-closed**).
 */
export function buildMovementsScopedWhere(
  filters: MovementWhereFilters,
  scopedIcaos: string[] | null,
): Prisma.MovementWhereInput {
  const where = buildMovementsWhere(filters);
  if (scopedIcaos === null) return where;
  return { AND: [where, { aerodrome: { in: scopedIcaos } }] };
}
