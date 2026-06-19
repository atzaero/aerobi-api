import { Injectable } from '@nestjs/common';

import { type OperationalEvent } from '@/generated/prisma/client';
import {
  OperationalEventStatus,
  OperationalEventType,
} from '@/generated/prisma/enums';
import { PrismaService } from '@/prisma/prisma.service';

/**
 * Entrada mínima para registrar uma não-conformidade operacional. `status`,
 * `detectedAt` e auditoria têm defaults no schema; `notifiedAt` fica `null` até
 * a notificação (#253).
 */
export interface CreateOperationalEventData {
  type: OperationalEventType;
  aerodrome: string;
  movementId: string;
  occurredAt: Date;
}

/**
 * Entrada para o dedupe de notificações (#253): procura uma não-conformidade já
 * notificada para a mesma matrícula+aeródromo dentro da janela `since`.
 */
export interface FindRecentNotifiedInput {
  aerodrome: string;
  registration: string;
  since: Date;
}

/**
 * Status considerados "em aberto" (não resolvidos) de uma não-conformidade —
 * usados tanto na deduplicação (não criar evento se já há um ativo) quanto na
 * resolução (encerrar os ativos quando o movimento volta a ser conforme).
 * Fonte única para os dois métodos não divergirem.
 */
const ACTIVE_STATUSES: OperationalEventStatus[] = [
  OperationalEventStatus.OPEN,
  OperationalEventStatus.ACKNOWLEDGED,
];

/** Acesso ao Prisma para `OperationalEvent` (tabela `operational_event`). */
@Injectable()
export class OperationalEventRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateOperationalEventData): Promise<OperationalEvent> {
    return this.prisma.operationalEvent.create({ data });
  }

  /**
   * Devolve a não-conformidade mais recente **já notificada** (`notifiedAt`
   * dentro de `since`) para a mesma matrícula (via relação `movement`) e
   * aeródromo, ou `null`. Base do dedupe de notificações (#253).
   */
  findRecentNotified(
    input: FindRecentNotifiedInput,
  ): Promise<OperationalEvent | null> {
    return this.prisma.operationalEvent.findFirst({
      where: {
        aerodrome: input.aerodrome,
        notifiedAt: { gte: input.since },
        deletedAt: null,
        movement: { registration: input.registration },
      },
      orderBy: { notifiedAt: 'desc' },
    });
  }

  /** Marca a não-conformidade como notificada em `when`. */
  async markNotified(id: string, when: Date): Promise<void> {
    await this.prisma.operationalEvent.update({
      where: { id },
      data: { notifiedAt: when },
    });
  }

  /**
   * Devolve a não-conformidade ainda **em aberto** (status não resolvido, não
   * eliminada) de um movimento para o `type` indicado, ou `null`. Usado para
   * evitar duplicar o evento quando a conformidade é reavaliada.
   */
  findOpenByMovement(
    movementId: string,
    type: OperationalEventType,
  ): Promise<OperationalEvent | null> {
    return this.prisma.operationalEvent.findFirst({
      where: {
        movementId,
        type,
        status: { in: ACTIVE_STATUSES },
        deletedAt: null,
      },
      orderBy: { detectedAt: 'desc' },
    });
  }

  /**
   * Resolve (`status: RESOLVED`) as não-conformidades em aberto de um movimento.
   * Usado quando uma reavaliação passa a `CONFORMANT` (ex.: matrícula corrigida)
   * e a não-conformidade anterior deixa de valer. Idempotente.
   */
  async resolveOpenByMovement(
    movementId: string,
    type: OperationalEventType,
  ): Promise<void> {
    await this.prisma.operationalEvent.updateMany({
      where: {
        movementId,
        type,
        status: { in: ACTIVE_STATUSES },
        deletedAt: null,
      },
      data: { status: OperationalEventStatus.RESOLVED },
    });
  }
}
