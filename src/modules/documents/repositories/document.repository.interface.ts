import type {
  Prisma,
  Document,
  DocumentType,
  Uf,
} from '@/generated/prisma/client';

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
   * Cria o documento e soft-deleta os anteriores **ativos** do mesmo
   * aeródromo+tipo numa **única transação `Serializable`** (a regra "1 ativo" do
   * `upload-aerodrome-file`, kml/image). Retenta em conflito de serialização
   * (P2034) sob uploads concorrentes. Retorna o documento criado.
   */
  createSupersedingActive(
    data: Prisma.DocumentCreateInput,
    aerodromeId: string,
    type: Document['type'],
    actorId: string,
  ): Promise<Document>;

  /** Aeródromo ativo (groupId + uf do grupo) para escopo/derivação. */
  findAerodromeForScope(aerodromeId: string): Promise<AerodromeScopeRef | null>;

  /**
   * Documento ativo (não soft-deletado) mais recente por tipo, do aeródromo,
   * restrito aos `types` pedidos — no máximo um por tipo (`distinct`). Base da
   * resolução on-read de `imgUrl`/`kmlUrl` no `GET /aerodromes/:id`.
   */
  findLatestActiveByAerodromeAndTypes(
    aerodromeId: string,
    types: DocumentType[],
  ): Promise<Document[]>;
}
