import { Injectable, Logger } from '@nestjs/common';

import { EXPORT_MAX_ROWS, toCsv } from '@/common/utils/csv.util';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { getErrorMessage } from '@/common/utils/error.util';
import { resolveActorGroupScope } from '@/common/utils/group-scope.util';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { UserRepository } from '@/modules/users/repositories/user.repository';

import { ExportAerodromeGroupsQueryDTO } from '../dtos/export-aerodrome-groups-query.dto';
import { aerodromeGroupExportColumns } from '../mappers/aerodrome-group-export.columns';
import { AerodromeGroupRepository } from '../repositories/aerodrome-group.repository';
import { buildAerodromeGroupScopedWhere } from '../utils/build-aerodrome-group-where';

/**
 * Resultado do export: o CSV mais os sinais de truncamento que o controller
 * expõe ao cliente (`X-Export-Truncated`/`X-Export-Total`), para a UI não tratar
 * um arquivo cortado no teto como o dataset completo (#392).
 */
export interface ExportAerodromeGroupsResult {
  csv: string;
  truncated: boolean;
  total: number;
}

@Injectable()
export class ExportAerodromeGroupsService {
  private readonly logger = new Logger(ExportAerodromeGroupsService.name);

  constructor(
    private readonly repo: AerodromeGroupRepository,
    private readonly userRepository: UserRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    query: ExportAerodromeGroupsQueryDTO,
    actor: AuthenticatedUser,
  ): Promise<ExportAerodromeGroupsResult> {
    /**
     * Mesmo escopo da listagem: COORDINATOR exporta só o próprio grupo; ADMIN
     * exporta todos. Ator inativo → 401; COORDINATOR sem grupo (`none`) cai no
     * `where` fail-closed do builder e recebe um CSV só com o cabeçalho — sem
     * "fail open".
     */
    const scope = await resolveActorGroupScope(
      actor.role,
      actor.id,
      this.userRepository,
      this.errorMessageService,
    );

    const where = buildAerodromeGroupScopedWhere(query, scope);

    /**
     * Busca `EXPORT_MAX_ROWS + 1` (sem paginação: `skip = 0`) para detectar
     * truncamento. Ao exceder o teto, corta no teto e sinaliza ao cliente via
     * `truncated`/`total` (o controller traduz em headers) — o `total` real só é
     * consultado neste ramo, evitando um `count` no caminho comum. Ordenação
     * `createdAt DESC` vem do repo.
     */
    const rows = await this.repo.findMany(where, 0, EXPORT_MAX_ROWS + 1);
    if (rows.length > EXPORT_MAX_ROWS) {
      /**
       * Total **best-effort**: o `count(where)` é uma query separada do
       * `findMany` — pode falhar (timeout/pool em filtro grande) ou divergir sob
       * soft-delete concorrente. O `try/catch` impede que um export que já tem
       * as linhas vire 500, e o `Math.max` garante que o total nunca seja menor
       * que o que foi de fato entregue (`EXPORT_MAX_ROWS`).
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
        `Export de grupos truncado em ${EXPORT_MAX_ROWS} de ${total} linhas.`,
      );
      return {
        csv: toCsv(rows.slice(0, EXPORT_MAX_ROWS), aerodromeGroupExportColumns),
        truncated: true,
        total,
      };
    }

    return {
      csv: toCsv(rows, aerodromeGroupExportColumns),
      truncated: false,
      total: rows.length,
    };
  }
}
