import { Injectable } from '@nestjs/common';

import { type OperationalEvent } from '@/generated/prisma/client';
import { OperationalEventType } from '@/generated/prisma/enums';
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
}
