import type { Prisma, Document, Uf } from '@/generated/prisma/client';

/** Aeródromo pai projetado para escopo/derivação de `uf` no create/upload. */
export interface AerodromeScopeRef {
  groupId: string;
  uf: Uf;
}

export interface IDocumentRepository {
  create(data: Prisma.DocumentCreateInput): Promise<Document>;

  update(id: string, data: Prisma.DocumentUpdateInput): Promise<Document>;

  findById(id: string): Promise<Document | null>;

  findMany(
    where: Prisma.DocumentWhereInput,
    skip: number,
    take: number,
  ): Promise<Document[]>;

  count(where: Prisma.DocumentWhereInput): Promise<number>;

  /** Todos os ativos que casam o `where`, ordenados, com teto (export). */
  findAllForExport(
    where: Prisma.DocumentWhereInput,
    take: number,
  ): Promise<Document[]>;

  /** Soft delete usando campos de auditoria deletedAt/deletedBy. */
  softDelete(id: string, deletedBy: string): Promise<Document>;

  /**
   * Soft-delete dos documentos **ativos** do mesmo aeródromo+tipo, exceto
   * `keepId` — a regra "1 ativo" do `upload-aerodrome-file`. Retorna a contagem
   * afetada.
   */
  softDeletePreviousActive(
    aerodromeId: string,
    type: Document['type'],
    keepId: string,
    deletedBy: string,
  ): Promise<number>;

  /** Aeródromo ativo (groupId + uf do grupo) para escopo/derivação. */
  findAerodromeForScope(aerodromeId: string): Promise<AerodromeScopeRef | null>;
}
