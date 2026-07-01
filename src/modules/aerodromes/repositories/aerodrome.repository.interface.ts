import type { Prisma } from '@/generated/prisma/client';

/**
 * Aeródromo já com a UF do grupo carregada. A UF **não** é coluna do aeródromo:
 * é derivada da relação `group.uf` (source-of-truth) e exposta no response.
 */
export type AerodromeWithGroup = Prisma.AerodromeGetPayload<{
  include: { group: { select: { uf: true } } };
}>;

export interface IAerodromeRepository {
  create(data: Prisma.AerodromeCreateInput): Promise<AerodromeWithGroup>;

  update(
    id: string,
    data: Prisma.AerodromeUpdateInput,
  ): Promise<AerodromeWithGroup>;

  findById(id: string): Promise<AerodromeWithGroup | null>;

  findMany(
    where: Prisma.AerodromeWhereInput,
    skip: number,
    take: number,
  ): Promise<AerodromeWithGroup[]>;

  count(where: Prisma.AerodromeWhereInput): Promise<number>;

  /** Soft delete usando campos de auditoria deletedAt/deletedBy. */
  softDelete(id: string, deletedBy: string): Promise<AerodromeWithGroup>;

  /**
   * Grupo ativo (não removido) para validar o vínculo do aeródromo no
   * create/update. `null` quando inexistente ou soft-deletado.
   */
  findActiveGroup(groupId: string): Promise<{ id: string } | null>;
}
