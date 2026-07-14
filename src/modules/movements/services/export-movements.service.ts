import { Injectable, Logger } from '@nestjs/common';

import { EXPORT_MAX_ROWS, toCsv } from '@/common/utils/csv.util';
import { getErrorMessage } from '@/common/utils/error.util';

import { ExportMovementsQueryDTO } from '../dtos/export-movements-query.dto';
import { movementExportColumns } from '../mappers/movement-export.columns';
import { MovementRepository } from '../repositories/movement.repository';
import { buildMovementsWhere } from '../utils/build-movements-where';

/**
 * Resultado do export: o CSV mais os sinais de truncamento que o controller
 * expõe ao cliente (`X-Export-Truncated`/`X-Export-Total`), para a UI não tratar
 * um arquivo cortado no teto como o dataset completo.
 */
export interface ExportMovementsResult {
  csv: string;
  truncated: boolean;
  total: number;
}

/**
 * Gera o CSV de movimentos (pousos/decolagens) a partir dos mesmos filtros da
 * listagem, sem paginação. Reusa o `where` builder compartilhado com a lista;
 * não resolve presigned (a imagem não vai no CSV). O CSV projeta o shape rico
 * direto da entidade (colunas em `movement-export.columns.ts`).
 */
@Injectable()
export class ExportMovementsService {
  private readonly logger = new Logger(ExportMovementsService.name);

  constructor(private readonly repo: MovementRepository) {}

  async execute(
    query: ExportMovementsQueryDTO,
  ): Promise<ExportMovementsResult> {
    const where = buildMovementsWhere(query);

    /**
     * Busca `EXPORT_MAX_ROWS + 1` (sem paginação: `skip = 0`) para detectar
     * truncamento sem um `count` no caminho comum. Ao exceder o teto, corta no
     * teto e sinaliza ao cliente. Ordenação `readingDatetime DESC` vem do repo.
     */
    const rows = await this.repo.findMany(where, 0, EXPORT_MAX_ROWS + 1);
    if (rows.length > EXPORT_MAX_ROWS) {
      /**
       * Total **best-effort**: o `count(where)` é uma query separada — pode
       * falhar (timeout) ou divergir sob soft-delete concorrente. O `try/catch`
       * impede que um export que já tem as linhas vire 500, e o `Math.max`
       * garante que o total nunca seja menor que o entregue (`EXPORT_MAX_ROWS`).
       */
      let total = EXPORT_MAX_ROWS;
      try {
        total = Math.max(await this.repo.count(where), EXPORT_MAX_ROWS);
      } catch (err) {
        this.logger.warn(
          `count do total truncado falhou (best-effort): ${getErrorMessage(err)}`,
        );
      }
      this.logger.warn(
        `Export de movimentos truncado em ${EXPORT_MAX_ROWS} de ${total} linhas.`,
      );
      return {
        csv: toCsv(rows.slice(0, EXPORT_MAX_ROWS), movementExportColumns),
        truncated: true,
        total,
      };
    }

    return {
      csv: toCsv(rows, movementExportColumns),
      truncated: false,
      total: rows.length,
    };
  }
}
