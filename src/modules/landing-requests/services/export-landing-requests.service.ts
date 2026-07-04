import { Injectable, Logger } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { EXPORT_MAX_ROWS, toCsv } from '@/common/utils/csv.util';
import { getErrorMessage } from '@/common/utils/error.util';
import { resolveOperationalActorScope } from '@/common/utils/group-scope.util';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { UserRepository } from '@/modules/users/repositories/user.repository';

import { ExportLandingRequestsQueryDTO } from '../dtos/export-landing-requests-query.dto';
import { landingRequestExportColumns } from '../mappers/landing-request-export.columns';
import { LandingRequestRepository } from '../repositories/landing-request.repository';
import { buildLandingRequestScopedWhere } from '../utils/build-landing-request-where';
import { resolveLandingRequestOrderBy } from '../utils/list-order';

/** CSV + sinais de truncamento expostos pelo controller (X-Export-*). */
export interface ExportLandingRequestsResult {
  csv: string;
  truncated: boolean;
  total: number;
}

/**
 * Export CSV da moderação de solicitações de pouso. Mesmo escopo/filtros da
 * listagem; 8 colunas na ordem do web (**sem CPF**). Busca `EXPORT_MAX_ROWS + 1`
 * para detectar truncamento.
 */
@Injectable()
export class ExportLandingRequestsService {
  private readonly logger = new Logger(ExportLandingRequestsService.name);

  constructor(
    private readonly repo: LandingRequestRepository,
    private readonly userRepository: UserRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    query: ExportLandingRequestsQueryDTO,
    actor: AuthenticatedUser,
  ): Promise<ExportLandingRequestsResult> {
    const scope = await resolveOperationalActorScope(
      actor.role,
      actor.id,
      this.userRepository,
      this.errorMessageService,
    );
    const where = buildLandingRequestScopedWhere(query, scope);
    const orderBy = resolveLandingRequestOrderBy(query.status);

    const rows = await this.repo.findMany(
      where,
      0,
      EXPORT_MAX_ROWS + 1,
      orderBy,
    );
    if (rows.length > EXPORT_MAX_ROWS) {
      let total = EXPORT_MAX_ROWS;
      try {
        total = Math.max(await this.repo.count(where), EXPORT_MAX_ROWS);
      } catch (err) {
        this.logger.warn(
          `count do total truncado falhou (best-effort): ${getErrorMessage(err)}`,
        );
      }
      this.logger.warn(
        `Export de solicitações de pouso truncado em ${EXPORT_MAX_ROWS} de ${total} linhas.`,
      );
      return {
        csv: toCsv(rows.slice(0, EXPORT_MAX_ROWS), landingRequestExportColumns),
        truncated: true,
        total,
      };
    }

    return {
      csv: toCsv(rows, landingRequestExportColumns),
      truncated: false,
      total: rows.length,
    };
  }
}
