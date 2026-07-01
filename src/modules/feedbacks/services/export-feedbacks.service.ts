import { Injectable, Logger } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { EXPORT_MAX_ROWS, toCsv } from '@/common/utils/csv.util';
import { getErrorMessage } from '@/common/utils/error.util';
import { resolveActorGroupScope } from '@/common/utils/group-scope.util';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { UserRepository } from '@/modules/users/repositories/user.repository';

import { ExportFeedbacksQueryDTO } from '../dtos/export-feedbacks-query.dto';
import { feedbackExportColumns } from '../mappers/feedback-export.columns';
import { FeedbackRepository } from '../repositories/feedback.repository';
import { buildFeedbackScopedWhere } from '../utils/build-feedback-where';

/**
 * Resultado do export: o CSV mais os sinais de truncamento que o controller
 * expõe ao cliente (`X-Export-Truncated`/`X-Export-Total`), para a UI não tratar
 * um arquivo cortado no teto como o dataset completo.
 */
export interface ExportFeedbacksResult {
  csv: string;
  truncated: boolean;
  total: number;
}

/**
 * Export CSV da moderação de feedbacks. Mesmo escopo/filtros da listagem
 * (COORDINATOR exporta só o próprio grupo; ADMIN, todos), materializando as
 * mesmas 4 colunas do web na ordem `createdAt DESC` que vem do repositório.
 */
@Injectable()
export class ExportFeedbacksService {
  private readonly logger = new Logger(ExportFeedbacksService.name);

  constructor(
    private readonly repo: FeedbackRepository,
    private readonly userRepository: UserRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    query: ExportFeedbacksQueryDTO,
    actor: AuthenticatedUser,
  ): Promise<ExportFeedbacksResult> {
    const scope = await resolveActorGroupScope(
      actor.role,
      actor.id,
      this.userRepository,
      this.errorMessageService,
    );

    const where = buildFeedbackScopedWhere(query, scope);

    /**
     * Busca `EXPORT_MAX_ROWS + 1` (sem paginação: `skip = 0`) para detectar
     * truncamento. Ao exceder o teto, corta no teto e sinaliza ao cliente via
     * `truncated`/`total`. Ordenação `createdAt DESC` vem do repo.
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
        `Export de feedbacks truncado em ${EXPORT_MAX_ROWS} de ${total} linhas.`,
      );
      return {
        csv: toCsv(rows.slice(0, EXPORT_MAX_ROWS), feedbackExportColumns),
        truncated: true,
        total,
      };
    }

    return {
      csv: toCsv(rows, feedbackExportColumns),
      truncated: false,
      total: rows.length,
    };
  }
}
