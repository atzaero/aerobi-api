import type { Prisma, Movement } from '@/generated/prisma/client';
import type { ConformityStatus } from '@/generated/prisma/enums';

import type { MovementWithSnapshot } from '../mappers/movement.mapper';
import type { ResolvedConformityStatus } from '../utils/conformity-status.util';

export interface IMovementRepository {
  create(data: Prisma.MovementCreateInput): Promise<Movement>;

  findById(id: string): Promise<MovementWithSnapshot | null>;

  findMany(
    where: Prisma.MovementWhereInput,
    skip: number,
    take: number,
  ): Promise<MovementWithSnapshot[]>;

  count(where: Prisma.MovementWhereInput): Promise<number>;

  /** Soft delete usando os campos de auditoria deletedAt/deletedBy. */
  softDelete(id: string, deletedBy: string): Promise<Movement>;

  /**
   * Corrige a matrícula (já canônica) de um movimento ativo e substitui, na
   * mesma transação, o snapshot RAB 1:1 re-resolvido para a matrícula corrigida.
   * Atualiza também `updatedBy`. Retorna o movimento com o snapshot carregado.
   */
  updateRegistration(
    id: string,
    registration: string,
    snapshot: Prisma.MovementAircraftSnapshotCreateWithoutMovementInput,
    updatedBy: string,
    conformityStatus?: ConformityStatus,
  ): Promise<MovementWithSnapshot>;

  /**
   * Persiste o status de conformidade resolvido de um movimento ativo (ação de
   * sistema do fluxo de conformidade). Idempotente e silenciosa se o movimento
   * já não existir; não altera `updatedBy`.
   */
  updateConformityStatus(
    id: string,
    conformityStatus: ResolvedConformityStatus,
  ): Promise<void>;

  /**
   * Último movimento ativo da matrícula dentro da janela de 48h anterior a
   * `reference` (estritamente antes de `reference`). Usado pela regra toggle de
   * inferência de pouso/decolagem na ingestão AUTOMATIC. Quando `aerodrome` é
   * informado, filtra também por aeródromo; quando null, considera só a matrícula.
   */
  findLastByRegistrationWithin48h(
    registration: string,
    aerodrome: string | null,
    reference: Date,
  ): Promise<Movement | null>;
}
