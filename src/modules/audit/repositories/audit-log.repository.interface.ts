import type {
  AuditAction,
  AuditLog,
  UserRole,
} from '@/generated/prisma/client';

/**
 * Filtros compartilhados por listagem e export (espelha `buildAuditQuery` do
 * `aerobi-web`): igualdade **exata** em `entityType`/`actorEmail`/`action` e
 * range **inclusivo** `[from, to]` sobre `createdAt`. `from`/`to` já chegam como
 * `Date` (o service converte do ms-epoch recebido na query).
 */
export interface AuditLogFilters {
  entityType?: string;
  actorEmail?: string;
  action?: AuditAction;
  from?: Date;
  to?: Date;
}

/** Filtros da listagem paginada + offset. */
export interface ListAuditLogsParams extends AuditLogFilters {
  skip: number;
  take: number;
}

/** Resultado de listagem paginada — rows + total para montar a metadata. */
export interface ListAuditLogsResult {
  rows: AuditLog[];
  total: number;
}

/**
 * Dados de criação de um registro de auditoria (append-only). `actor*` são
 * snapshot no momento da ação e podem ser nulos (ação pública/sistêmica).
 * `before`/`after`/`metadata` são `unknown` (recortes JSON-serializáveis
 * montados pelo call-site) — o builder omite os ausentes (coluna fica NULL).
 */
export interface CreateAuditLogData {
  actorId?: string | null;
  actorEmail?: string | null;
  actorRole?: UserRole | null;
  action: AuditAction;
  entityType: string;
  entityId: string;
  before?: unknown;
  after?: unknown;
  metadata?: unknown;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/**
 * Contrato do repositório de auditoria. Append-only: só `create` escreve; não há
 * update/soft-delete (a trilha não se altera). `findById` não filtra
 * `deletedAt` porque a coluna não existe.
 */
export interface IAuditLogRepository {
  create(data: CreateAuditLogData): Promise<AuditLog>;
  findManyPaginated(params: ListAuditLogsParams): Promise<ListAuditLogsResult>;
  findById(id: string): Promise<AuditLog | null>;

  /** Busca linhas para export (ordenadas `createdAt DESC`, tiebreaker `id`). */
  findManyForExport(
    filters: AuditLogFilters,
    take: number,
  ): Promise<AuditLog[]>;

  /** Conta linhas que casam os filtros (para sinalizar truncamento no export). */
  countForExport(filters: AuditLogFilters): Promise<number>;
}
