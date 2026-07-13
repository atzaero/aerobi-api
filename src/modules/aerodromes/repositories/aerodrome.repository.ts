import { Injectable } from '@nestjs/common';

import { Prisma } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

import type {
  AerodromeDashboardSnapshotRow,
  AerodromeVisibleWithGroup,
  AerodromeWithGroup,
  IAerodromeRepository,
} from './aerodrome.repository.interface';

const activeWhere: Pick<Prisma.AerodromeWhereInput, 'deletedAt'> = {
  deletedAt: null,
};

/**
 * Carrega a UF do grupo em toda leitura/escrita: a UF do aeródromo é derivada de
 * `group.uf` (não é coluna própria), e o mapper a expõe no response.
 */
const includeGroupUf = {
  group: { select: { uf: true } },
} satisfies Prisma.AerodromeInclude;

/**
 * Leituras públicas (`/visible*`): UF do grupo + GeoJSON ativo (não soft-deletado),
 * só os campos necessários ao mapper slim do mapa. Atenção: `geoJson` é JSONB
 * completo — em `findAllVisible` o volume cresce com o número de aeródromos
 * READY (medir payload + gzip em staging).
 */
const includeVisible = {
  group: { select: { uf: true } },
  geojson: {
    where: { deletedAt: null },
    select: {
      status: true,
      kind: true,
      mapFileType: true,
      geoJson: true,
    },
  },
} satisfies Prisma.AerodromeInclude;

@Injectable()
export class AerodromeRepository implements IAerodromeRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.AerodromeCreateInput): Promise<AerodromeWithGroup> {
    return this.prisma.aerodrome.create({ data, include: includeGroupUf });
  }

  update(
    id: string,
    data: Prisma.AerodromeUpdateInput,
  ): Promise<AerodromeWithGroup> {
    return this.prisma.aerodrome.update({
      where: { id, ...activeWhere },
      data,
      include: includeGroupUf,
    });
  }

  findById(id: string): Promise<AerodromeWithGroup | null> {
    return this.prisma.aerodrome.findFirst({
      where: { id, ...activeWhere },
      include: includeGroupUf,
    });
  }

  findMany(
    where: Prisma.AerodromeWhereInput,
    skip: number,
    take: number,
  ): Promise<AerodromeWithGroup[]> {
    return this.prisma.aerodrome.findMany({
      where: {
        AND: [{ ...where }, activeWhere],
      },
      skip,
      take,
      /**
       * `id` como desempate estável: `createdAt` não é único (registros criados
       * na mesma transação/`createMany` compartilham o `now()`), então sem um
       * segundo critério a paginação por offset poderia duplicar/pular linhas
       * empatadas.
       */
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      include: includeGroupUf,
    });
  }

  findAllVisible(): Promise<AerodromeVisibleWithGroup[]> {
    return this.prisma.aerodrome.findMany({
      where: { isView: true, ...activeWhere },
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      include: includeVisible,
    });
  }

  findVisibleByIcao(icao: string): Promise<AerodromeVisibleWithGroup | null> {
    return this.prisma.aerodrome.findFirst({
      where: { icao, isView: true, ...activeWhere },
      include: includeVisible,
    });
  }

  count(where: Prisma.AerodromeWhereInput): Promise<number> {
    return this.prisma.aerodrome.count({
      where: {
        AND: [{ ...where }, activeWhere],
      },
    });
  }

  softDelete(id: string, deletedBy: string): Promise<AerodromeWithGroup> {
    return this.prisma.aerodrome.update({
      where: { id, ...activeWhere },
      data: {
        deletedAt: new Date(),
        deletedBy,
        updatedBy: deletedBy,
      },
      include: includeGroupUf,
    });
  }

  findActiveGroup(groupId: string): Promise<{ id: string } | null> {
    return this.prisma.group.findFirst({
      where: { id: groupId, deletedAt: null },
      select: { id: true },
    });
  }

  findForDashboardSnapshot(
    aerodromeIds: string[] | null,
  ): Promise<AerodromeDashboardSnapshotRow[]> {
    const where: Prisma.AerodromeWhereInput = { ...activeWhere };
    if (aerodromeIds !== null) where.id = { in: aerodromeIds };

    return this.prisma.aerodrome.findMany({
      where,
      select: {
        isOpen: true,
        isView: true,
        construction: true,
        lit: true,
        fueling: true,
      },
    });
  }

  async findActiveIdsByGroup(groupId: string): Promise<string[]> {
    const rows = await this.prisma.aerodrome.findMany({
      where: { groupId, ...activeWhere },
      select: { id: true },
    });
    return rows.map((r) => r.id);
  }
}
