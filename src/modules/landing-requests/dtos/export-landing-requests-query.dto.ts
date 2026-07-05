import { LandingRequestFilterQueryDTO } from './landing-request-filter-query.dto';

/**
 * Query do `GET /landing-requests/export`: os mesmos filtros da listagem, sem
 * paginação (o export materializa todo o dataset filtrado até `EXPORT_MAX_ROWS`).
 */
export class ExportLandingRequestsQueryDTO extends LandingRequestFilterQueryDTO {}
