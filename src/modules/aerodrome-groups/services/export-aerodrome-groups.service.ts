import { Injectable, Logger } from '@nestjs/common';

import { EXPORT_MAX_ROWS, toCsv } from '@/common/utils/csv.util';
import { resolveActorGroupScope } from '@/common/utils/group-scope.util';
import type { Prisma } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { UserRepository } from '@/modules/users/repositories/user.repository';

import { ExportAerodromeGroupsQueryDTO } from '../dtos/export-aerodrome-groups-query.dto';
import { aerodromeGroupExportColumns } from '../mappers/aerodrome-group-export.columns';
import { AerodromeGroupRepository } from '../repositories/aerodrome-group.repository';

@Injectable()
export class ExportAerodromeGroupsService {
  private readonly logger = new Logger(ExportAerodromeGroupsService.name);

  constructor(
    private readonly repo: AerodromeGroupRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(
    query: ExportAerodromeGroupsQueryDTO,
    actor: AuthenticatedUser,
  ): Promise<string> {
    /**
     * Mesmo escopo da listagem: COORDINATOR exporta só o próprio grupo; ADMIN
     * exporta todos. COORDINATOR sem grupo (`none`) recebe um CSV só com o
     * cabeçalho — sem "fail open".
     */
    const scope = await resolveActorGroupScope(actor.role, actor.id, (id) =>
      this.userRepository.findActiveById(id),
    );

    if (scope.kind === 'none') {
      return toCsv([], aerodromeGroupExportColumns);
    }

    const where: Prisma.AerodromeGroupWhereInput = {};
    if (query.uf !== undefined) {
      where.uf = query.uf;
    }
    if (query.name !== undefined) {
      where.name = { contains: query.name, mode: 'insensitive' };
    }
    if (scope.kind === 'group') {
      where.id = scope.groupId;
    }

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
