import { Injectable, Logger } from '@nestjs/common';

import { EXPORT_MAX_ROWS, toCsv } from '@/common/utils/csv.util';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { getErrorMessage } from '@/common/utils/error.util';
import { resolveActorGroupScope } from '@/common/utils/group-scope.util';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { ExportUsersQueryDto } from '../dtos/export-users-query.dto';
import { userExportColumns } from '../mappers/user-export.columns';
import { UserRepository } from '../repositories/user.repository';
import type { ExportUsersFilters } from '../repositories/user.repository.interface';

/**
 * Resultado do export: o CSV mais os sinais de truncamento que o controller
 * expõe ao cliente (`X-Export-Truncated`/`X-Export-Total`).
 */
export interface ExportUsersResult {
  csv: string;
  truncated: boolean;
  total: number;
}

/**
 * Export CSV de usuários (`GET /users/export`) — espelha o `export` do
 * `aerobi-web`, mas **aplica o escopo de grupo** que o registry do web omite:
 * COORDINATOR exporta apenas o próprio grupo (igual à listagem); ADMIN exporta
 * todos. Mesmos filtros da list (`search`/`role`/`groupId`).
 */
@Injectable()
export class ExportUsersService {
  private readonly logger = new Logger(ExportUsersService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    query: ExportUsersQueryDto,
    actor: AuthenticatedUser,
  ): Promise<ExportUsersResult> {
    const scope = await resolveActorGroupScope(
      actor.role,
      actor.id,
      this.userRepository,
      this.errorMessageService,
    );

    /** COORDINATOR sem grupo (`none`) recebe CSV só com cabeçalho — sem "fail open". */
    if (scope.kind === 'none') {
      return { csv: toCsv([], userExportColumns), truncated: false, total: 0 };
    }

    const groupId = scope.kind === 'group' ? scope.groupId : query.groupId;
    const filters: ExportUsersFilters = {
      ...(query.search !== undefined && { search: query.search }),
      ...(query.role !== undefined && { role: query.role }),
      ...(groupId !== undefined && { groupId }),
    };

    /**
     * Busca `EXPORT_MAX_ROWS + 1` (sem paginação) para detectar truncamento;
     * ao exceder o teto, corta e sinaliza ao cliente. O `count` real só roda
     * nesse ramo, evitando uma query extra no caminho comum.
     */
    const rows = await this.userRepository.findManyForExport(
      filters,
      EXPORT_MAX_ROWS + 1,
    );

    if (rows.length > EXPORT_MAX_ROWS) {
      let total = EXPORT_MAX_ROWS;
      try {
        total = Math.max(
          await this.userRepository.countForExport(filters),
          EXPORT_MAX_ROWS,
        );
      } catch (err) {
        this.logger.warn(
          `count do total truncado falhou (best-effort): ${getErrorMessage(err)}`,
        );
      }
      this.logger.warn(
        `Export de usuários truncado em ${EXPORT_MAX_ROWS} de ${total} linhas.`,
      );
      return {
        csv: toCsv(rows.slice(0, EXPORT_MAX_ROWS), userExportColumns),
        truncated: true,
        total,
      };
    }

    return {
      csv: toCsv(rows, userExportColumns),
      truncated: false,
      total: rows.length,
    };
  }
}
