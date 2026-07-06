import { EXPORT_MAX_ROWS } from '@/common/utils/csv.util';

/**
 * Teto de intervenções carregadas em memória para list/export/stats (paridade
 * com o export CSV e guarda contra datasets gigantes acidentais).
 */
export const MAINTENANCE_IN_MEMORY_MAX_ROWS = EXPORT_MAX_ROWS;
