import type { Prisma, Movement } from '@/generated/prisma/client';

import type { MovementWithSnapshot } from '../mappers/movement.mapper';

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
