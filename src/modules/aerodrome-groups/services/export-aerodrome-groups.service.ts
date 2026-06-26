import { Injectable, Logger } from '@nestjs/common';

import { EXPORT_MAX_ROWS, toCsv } from '@/common/utils/csv.util';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resolveActorGroupScope } from '@/common/utils/group-scope.util';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { UserRepository } from '@/modules/users/repositories/user.repository';

import { ExportAerodromeGroupsQueryDTO } from '../dtos/export-aerodrome-groups-query.dto';
import { aerodromeGroupExportColumns } from '../mappers/aerodrome-group-export.columns';
import { AerodromeGroupRepository } from '../repositories/aerodrome-group.repository';
import { buildAerodromeGroupScopedWhere } from '../utils/build-aerodrome-group-where';

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
  ): Promise<string> {
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
     * truncamento — se vier além do teto, corta no teto e loga (o arquivo não
     * sinaliza que foi truncado). Ordenação `createdAt DESC` vem do repo.
     */
    const rows = await this.repo.findMany(where, 0, EXPORT_MAX_ROWS + 1);
    if (rows.length > EXPORT_MAX_ROWS) {
      this.logger.warn(
        `Export de grupos truncado em ${EXPORT_MAX_ROWS} linhas (resultado excedeu o teto).`,
      );
      return toCsv(rows.slice(0, EXPORT_MAX_ROWS), aerodromeGroupExportColumns);
    }

    return toCsv(rows, aerodromeGroupExportColumns);
  }
}
