import { AerodromeFeedbackFilterQueryDTO } from './aerodrome-feedback-filter-query.dto';

/**
 * Query do export CSV: os mesmos filtros da listagem, **sem paginação** (o export
 * traz todas as linhas do escopo até `EXPORT_MAX_ROWS`). Reusa
 * `AerodromeFeedbackFilterQueryDTO` para não divergir do contrato da list.
 */
export class ExportAerodromeFeedbacksQueryDTO extends AerodromeFeedbackFilterQueryDTO {}
