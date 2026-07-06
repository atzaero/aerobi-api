import { MaintenanceFilterQueryDTO } from './maintenance-filter-query.dto';

/**
 * Query do export CSV: mesmos filtros da listagem, sem paginação.
 */
export class ExportMaintenancesQueryDTO extends MaintenanceFilterQueryDTO {}
