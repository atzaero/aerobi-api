import { HttpStatus, Injectable } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { httpError } from '@/common/exceptions/http-error.util';
import { AerodromeRepository } from '@/modules/aerodromes/repositories/aerodrome.repository';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { UserRepository } from '@/modules/users/repositories/user.repository';

import type { DashboardResponseDTO } from '../dtos/dashboard-response.dto';
import { GetDashboardQueryDTO } from '../dtos/get-dashboard-query.dto';
import { resolveDashboardAerodromeScope } from '../utils/dashboard-scope.util';
import {
  resolveDashboardRange,
  type DashboardRange,
} from '../utils/date-range.util';
import { BuildAdminDashboardService } from './builders/build-admin-dashboard.service';
import { BuildOperatorDashboardService } from './builders/build-operator-dashboard.service';
import { BuildTechnicalDashboardService } from './builders/build-technical-dashboard.service';
import { resolveDashboardBuilder } from './dispatcher';

/**
 * Orquestra `GET /dashboard`: valida a faixa de tempo, resolve o escopo do ator
 * (materializado em ids), escolhe o builder do papel (deny-by-default) e devolve
 * o DTO discriminado por `meta.role`. Não monta métricas — delega aos builders.
 */
@Injectable()
export class GetDashboardService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly aerodromeRepository: AerodromeRepository,
    private readonly errorMessageService: ErrorMessageService,
    private readonly adminBuilder: BuildAdminDashboardService,
    private readonly operatorBuilder: BuildOperatorDashboardService,
    private readonly technicalBuilder: BuildTechnicalDashboardService,
  ) {}

  async execute(
    actor: AuthenticatedUser,
    query: GetDashboardQueryDTO,
  ): Promise<DashboardResponseDTO> {
    const range = this.resolveRange(query);

    const builder = resolveDashboardBuilder(actor.role, {
      admin: (ctx) => this.adminBuilder.build(ctx),
      operator: (ctx) => this.operatorBuilder.build(ctx),
      technical: (ctx) => this.technicalBuilder.build(ctx),
    });
    if (!builder) {
      throw httpError(
        this.errorMessageService,
        ErrorCode.FORBIDDEN,
        HttpStatus.FORBIDDEN,
        { RESOURCE: 'dashboard' },
      );
    }

    const scope = await resolveDashboardAerodromeScope(
      actor,
      this.userRepository,
      this.aerodromeRepository,
      this.errorMessageService,
    );

    return builder({ role: actor.role, scope, range });
  }

  /**
   * Resolve a faixa de tempo. `custom` exige `from`/`to` presentes com
   * `from ≤ to` — senão `VALIDATION_FAILED` (400), espelhando o `.refine` do
   * schema Zod do web.
   */
  private resolveRange(query: GetDashboardQueryDTO): DashboardRange {
    if (query.preset === 'custom') {
      const { from, to } = query;
      if (from == null || to == null || from > to) {
        throw httpError(
          this.errorMessageService,
          ErrorCode.VALIDATION_FAILED,
          HttpStatus.BAD_REQUEST,
          {
            DETAILS:
              'Faixa personalizada exige `from` e `to` (em ms epoch) com `from` ≤ `to`.',
          },
        );
      }
    }
    return resolveDashboardRange(query);
  }
}
