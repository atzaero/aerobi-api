import { MovementFilterQueryDTO } from './movement-filter-query.dto';

/**
 * Query do export CSV `GET /movements/export`: mesmos filtros da listagem, sem
 * paginação (o export varre todas as linhas que casam o filtro, até o teto).
 */
export class ExportMovementsQueryDTO extends MovementFilterQueryDTO {}
