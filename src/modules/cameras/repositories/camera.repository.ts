import { Injectable } from '@nestjs/common';

import { Prisma, type Camera } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

import type {
  ICameraRepository,
  StreamIdentity,
} from './camera.repository.interface';

const activeWhere: Pick<Prisma.CameraWhereInput, 'deletedAt'> = {
  deletedAt: null,
};

@Injectable()
export class CameraRepository implements ICameraRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.CameraCreateInput): Promise<Camera> {
    return this.prisma.camera.create({ data });
  }

  update(id: string, data: Prisma.CameraUpdateInput): Promise<Camera> {
    return this.prisma.camera.update({ where: { id, ...activeWhere }, data });
  }

  findById(id: string): Promise<Camera | null> {
    return this.prisma.camera.findFirst({ where: { id, ...activeWhere } });
  }

  findMany(
    where: Prisma.CameraWhereInput,
    skip: number,
    take: number,
  ): Promise<Camera[]> {
    return this.prisma.camera.findMany({
      where: { AND: [{ ...where }, activeWhere] },
      skip,
      take,
      /**
       * `icao ASC, name ASC` (paridade com o web) + `id` como tiebreaker: garante
       * paginação determinística quando duas câmeras compartilham `icao`/`name`.
       */
      orderBy: [{ icao: 'asc' }, { name: 'asc' }, { id: 'asc' }],
    });
  }

  count(where: Prisma.CameraWhereInput): Promise<number> {
    return this.prisma.camera.count({
      where: { AND: [{ ...where }, activeWhere] },
    });
  }

  /**
   * Soft delete: seta `deletedAt`/`deletedBy`, `updatedBy` (a câmera é editável —
   * espelha o soft-delete de `aerodromes`/`landing-requests`) e `enabled=false`
   * (paridade com o `delete` do `aerobi-web`, que também desliga o stream).
   */
  softDelete(id: string, deletedBy: string): Promise<Camera> {
    return this.prisma.camera.update({
      where: { id, ...activeWhere },
      data: {
        deletedAt: new Date(),
        deletedBy,
        updatedBy: deletedBy,
        enabled: false,
      },
    });
  }

  findActiveAerodrome(
    aerodromeId: string,
  ): Promise<{ id: string; groupId: string; icao: string } | null> {
    return this.prisma.aerodrome.findFirst({
      where: { id: aerodromeId, deletedAt: null },
      select: { id: true, groupId: true, icao: true },
    });
  }

  findActiveStreamConflict(
    identity: StreamIdentity,
  ): Promise<{ id: string } | null> {
    return this.prisma.camera.findFirst({
      where: {
        ...activeWhere,
        icao: identity.icao,
        mediamtxNode: identity.mediamtxNode,
        mediamtxPath: identity.mediamtxPath,
        ...(identity.exceptId ? { id: { not: identity.exceptId } } : {}),
      },
      select: { id: true },
    });
  }
}
