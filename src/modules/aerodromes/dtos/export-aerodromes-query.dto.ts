import { AerodromeFilterQueryDTO } from './aerodrome-filter-query.dto';

/**
 * Query do export CSV: os mesmos filtros da listagem, **sem paginação** (o export
 * traz todas as linhas do escopo até `EXPORT_MAX_ROWS`). Reusa
 * `AerodromeFilterQueryDTO` para não divergir do contrato da list.
 */
export class ExportAerodromesQueryDTO extends AerodromeFilterQueryDTO {}
