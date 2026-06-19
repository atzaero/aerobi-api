import { Injectable } from '@nestjs/common';

import { Prisma, type Movement } from '@/generated/prisma/client';
import type { ConformityStatus } from '@/generated/prisma/enums';
import { PrismaService } from '@/prisma/prisma.service';

import type { MovementWithSnapshot } from '../mappers/movement.mapper';
import type { ResolvedConformityStatus } from '../utils/conformity-status.util';

import type { IMovementRepository } from './movement.repository.interface';

const activeWhere: Pick<Prisma.MovementWhereInput, 'deletedAt'> = {
  deletedAt: null,
};

/** Janela da regra toggle de inferência de pouso/decolagem (48h). */
const TOGGLE_WINDOW_MS = 48 * 60 * 60 * 1000;

@Injectable()
export class MovementRepository implements IMovementRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.MovementCreateInput): Promise<Movement> {
    return this.prisma.movement.create({ data });
  }

  findById(id: string): Promise<MovementWithSnapshot | null> {
    return this.prisma.movement.findFirst({
      where: { id, ...activeWhere },
      include: { aircraftSnapshot: true },
    });
  }

  findMany(
    where: Prisma.MovementWhereInput,
    skip: number,
    take: number,
  ): Promise<MovementWithSnapshot[]> {
    return this.prisma.movement.findMany({
      where: { AND: [{ ...where }, activeWhere] },
      skip,
      take,
      orderBy: { readingDatetime: 'desc' },
      include: { aircraftSnapshot: true },
    });
  }

  count(where: Prisma.MovementWhereInput): Promise<number> {
    return this.prisma.movement.count({
      where: { AND: [{ ...where }, activeWhere] },
    });
  }

  softDelete(id: string, deletedBy: string): Promise<Movement> {
    return this.prisma.movement.update({
      where: { id, ...activeWhere },
      data: { deletedAt: new Date(), deletedBy, updatedBy: deletedBy },
    });
  }

  updateRegistration(
    id: string,
    registration: string,
    snapshot: Prisma.MovementAircraftSnapshotCreateWithoutMovementInput,
    updatedBy: string,
    conformityStatus?: ConformityStatus,
  ): Promise<MovementWithSnapshot> {
    return this.prisma.movement.update({
      where: { id, ...activeWhere },
      data: {
        registration,
        updatedBy,
        /**
         * Quando informado, redefine a conformidade na mesma transação da
         * correção da matrícula: a decisão calculada para a matrícula anterior
         * fica obsoleta, então o caller passa `PENDING` (reavaliação pendente).
         */
        ...(conformityStatus !== undefined ? { conformityStatus } : {}),
        /**
         * Substitui o snapshot 1:1 re-resolvido para a matrícula corrigida. O
         * snapshot sempre existe (invariante 1:1 garantida na criação), então
         * `update` aninhado é seguro — atômico na mesma transação do movimento.
         * Reusa o input de criação (campos escalares idênticos aos do create).
         */
        aircraftSnapshot: { update: snapshot },
      },
      include: { aircraftSnapshot: true },
    });
  }

  /**
   * Persiste o status de conformidade resolvido (`CONFORMANT`/`NON_CONFORMANT`)
   * de um movimento ativo. Ação de sistema disparada pelo fluxo de conformidade
   * (assíncrono); usa `updateMany` para ser idempotente e silenciosa caso o
   * movimento já tenha sido removido (não relança). Não toca em `updatedBy`. O
   * tipo restrito impede resolver para `PENDING`/`NOT_APPLICABLE`.
   */
  async updateConformityStatus(
    id: string,
    conformityStatus: ResolvedConformityStatus,
  ): Promise<void> {
    await this.prisma.movement.updateMany({
      where: { id, ...activeWhere },
      data: { conformityStatus },
    });
  }

  findLastByRegistrationWithin48h(
    registration: string,
    aerodrome: string | null,
    reference: Date,
  ): Promise<Movement | null> {
    const windowStart = new Date(reference.getTime() - TOGGLE_WINDOW_MS);

    return this.prisma.movement.findFirst({
      where: {
        ...activeWhere,
        registration,
        // Estritamente antes de `reference` e dentro das últimas 48h.
        readingDatetime: { gt: windowStart, lt: reference },
        // Só restringe por aeródromo quando ele é conhecido.
        ...(aerodrome !== null ? { aerodrome } : {}),
      },
      orderBy: { readingDatetime: 'desc' },
    });
  }
}
