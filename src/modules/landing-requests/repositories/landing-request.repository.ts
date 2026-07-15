import { Injectable } from '@nestjs/common';

import {
  LandingRequestStatus,
  Prisma,
  type LandingRequest,
} from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

import type {
  ILandingRequestRepository,
  LandingRequestAircraftCreateData,
  LandingRequestDashboardRow,
  LandingRequestWithAircraft,
  TargetAerodrome,
} from './landing-request.repository.interface';

const activeWhere: Pick<Prisma.LandingRequestWhereInput, 'deletedAt'> = {
  deletedAt: null,
};

/**
 * Ordenação default (fila operacional pendentes-FIFO). A list/export passam a
 * ordenação resolvida por `resolveLandingRequestOrderBy` (varia com o filtro de
 * status, espelhando o web); este default cobre chamadas sem `orderBy`.
 */
const defaultOrderBy: Prisma.LandingRequestOrderByWithRelationInput[] = [
  { status: 'asc' },
  { requestDate: 'asc' },
  { id: 'asc' },
];

@Injectable()
export class LandingRequestRepository implements ILandingRequestRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Grava a solicitação e, quando houver, o snapshot RAB (1:1) numa **única
   * transação** — espelha o batch atômico do web. Sem o snapshot, só a
   * solicitação é criada.
   */
  createWithAircraft(
    data: Prisma.LandingRequestCreateInput,
    aircraft: LandingRequestAircraftCreateData | null,
  ): Promise<LandingRequest> {
    return this.prisma.$transaction(async (tx) => {
      const created = await tx.landingRequest.create({ data });
      if (aircraft) {
        await tx.landingRequestAircraft.create({
          data: {
            ...aircraft,
            landingRequest: { connect: { id: created.id } },
          },
        });
      }
      return created;
    });
  }

  update(
    id: string,
    data: Prisma.LandingRequestUpdateInput,
  ): Promise<LandingRequest> {
    return this.prisma.landingRequest.update({
      where: { id, ...activeWhere },
      data,
    });
  }

  /**
   * Atualização condicional atômica da decisão: só afeta a linha se ela ainda
   * está `PENDING` (e ativa). Fecha a janela TOCTOU de duas decisões
   * concorrentes — retorna o nº de linhas afetadas (0 = já respondida/corrida
   * perdida), que o service traduz em 409.
   */
  async updateIfPending(
    id: string,
    data: Prisma.LandingRequestUpdateInput,
  ): Promise<number> {
    const { count } = await this.prisma.landingRequest.updateMany({
      where: { id, status: LandingRequestStatus.PENDING, ...activeWhere },
      data,
    });
    return count;
  }

  findById(id: string): Promise<LandingRequestWithAircraft | null> {
    return this.prisma.landingRequest.findFirst({
      where: { id, ...activeWhere },
      include: { aircraft: true },
    });
  }

  findMany(
    where: Prisma.LandingRequestWhereInput,
    skip: number,
    take: number,
    orderBy: Prisma.LandingRequestOrderByWithRelationInput[] = defaultOrderBy,
  ): Promise<LandingRequest[]> {
    return this.prisma.landingRequest.findMany({
      where: { AND: [{ ...where }, activeWhere] },
      skip,
      take,
      orderBy,
    });
  }

  count(where: Prisma.LandingRequestWhereInput): Promise<number> {
    return this.prisma.landingRequest.count({
      where: { AND: [{ ...where }, activeWhere] },
    });
  }

  async findForDashboard(
    aerodromeIds: string[] | null,
    fromMs: number,
    toMs: number,
  ): Promise<LandingRequestDashboardRow[]> {
    const where: Prisma.LandingRequestWhereInput = {
      ...activeWhere,
      requestDate: { gte: new Date(fromMs), lte: new Date(toMs) },
    };
    if (aerodromeIds !== null) where.aerodromeId = { in: aerodromeIds };

    const rows = await this.prisma.landingRequest.findMany({
      where,
      select: { requestDate: true, reviewedAt: true, status: true },
    });
    return rows.map((r) => ({
      requestDateMs: r.requestDate.getTime(),
      reviewedAtMs: r.reviewedAt ? r.reviewedAt.getTime() : null,
      status: r.status,
    }));
  }

  softDelete(id: string, deletedBy: string): Promise<LandingRequest> {
    return this.prisma.landingRequest.update({
      where: { id, ...activeWhere },
      data: { deletedAt: new Date(), deletedBy, updatedBy: deletedBy },
    });
  }

  async findTargetAerodrome(id: string): Promise<TargetAerodrome | null> {
    const aerodrome = await this.prisma.aerodrome.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        icao: true,
        name: true,
        isOpen: true,
        groupId: true,
        group: { select: { uf: true } },
      },
    });
    if (!aerodrome) {
      return null;
    }
    return {
      id: aerodrome.id,
      icao: aerodrome.icao,
      name: aerodrome.name,
      isOpen: aerodrome.isOpen,
      groupId: aerodrome.groupId,
      uf: aerodrome.group.uf,
    };
  }
}
