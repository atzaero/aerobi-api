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

/** Acesso ao Prisma para `OperationalEvent` (tabela `operational_event`). */
@Injectable()
export class OperationalEventRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateOperationalEventData): Promise<OperationalEvent> {
    return this.prisma.operationalEvent.create({ data });
  }
}
