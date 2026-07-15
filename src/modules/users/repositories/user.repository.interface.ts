import type { Uf, User, UserRole } from '@/generated/prisma/client';

/** Dados para criar um User novo (pendente — sem password). */
export interface CreateUserData {
  email: string;
  name: string;
  phone?: string | null;
  role: UserRole;
  /**
   * Grupo de aeródromos do user. `null` para ADMIN global (sem grupo);
   * não-nulo para COORDINATOR/OPERATOR/TECHNICAL. O service resolve a origem
   * (grupo do COORDINATOR ator ou informado pelo ADMIN).
   */
  groupId?: string | null;
  /** UF do grupo. `null` para ADMIN global; alinhado com `groupId`. */
  state?: Uf | null;
  invitedById?: string;
  invitedAt?: Date;
  createdBy?: string;
}

/** Atualização parcial de User — só inclui campos que mudam. */
export interface UpdateUserData {
  name?: string;
  email?: string;
  phone?: string | null;
  timezone?: string | null;
  role?: UserRole;
  password?: string | null;
  emailVerified?: boolean;
  acceptedInviteAt?: Date | null;
  lastLoginAt?: Date | null;
  updatedBy?: string;
}

/**
 * Filtros compartilhados por listagem e export: `search` (email/nome ILIKE),
 * `role` (igualdade) e `groupId`. Para COORDINATOR o `groupId` é forçado pelo
 * service (próprio grupo); ADMIN informa livremente. Reusados pelo `buildWhere`
 * do repositório — manter um único contrato evita divergência silenciosa.
 */
export interface ExportUsersFilters {
  search?: string;
  role?: UserRole;
  groupId?: string;
}

/** Filtros da listagem paginada (GET /users): os de export + paginação. */
export interface ListUsersParams extends ExportUsersFilters {
  skip: number;
  take: number;
}

/** Resultado de listagem paginada — rows + total para construir metadata. */
export interface ListUsersResult {
  rows: User[];
  total: number;
}

/** User com o nome do grupo resolvido (join), para a coluna "Grupo" do export. */
export type UserWithGroupName = User & { group: { name: string } | null };

/**
 * Contrato do repositório de Users.
 *
 * "Ativo" = `deletedAt === null`. Os finders por id têm 2 variantes:
 *  - `findById` retorna o registro mesmo se soft-deletado (auditoria)
 *  - `findActiveById` filtra `deletedAt: null`
 *
 * Implementações devem usar `email` sempre em lowercase no DB (normalizado
 * pelo service antes de chamar). A constraint única é case-sensitive.
 */
export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findActiveById(id: string): Promise<User | null>;

  /** True se já existe User (mesmo soft-deletado) com este email. */
  existsByEmail(email: string): Promise<boolean>;

  create(data: CreateUserData): Promise<User>;
  update(id: string, data: UpdateUserData): Promise<User>;

  /** Marca `deletedAt` + `deletedBy`. Não apaga linha. */
  softDelete(id: string, deletedBy?: string): Promise<User>;

  /**
   * Busca usuários por lista de ids (para resolver atores/revisores no response).
   * Inclui soft-deletados (a trilha mostra quem agiu mesmo após desativação);
   * ids não-UUID/inexistentes são simplesmente ignorados.
   */
  findManyByIds(ids: string[]): Promise<User[]>;

  /**
   * E-mails (deduplicados) de coordenadores e operadores **ativos** de um grupo
   * — destinatários do staff na notificação de nova solicitação de pouso.
   */
  findGroupStaffEmails(groupId: string): Promise<string[]>;

  findManyPaginated(params: ListUsersParams): Promise<ListUsersResult>;

  /** Busca ativos para export (com nome do grupo), ordenados `createdAt DESC`. */
  findManyForExport(
    filters: ExportUsersFilters,
    take: number,
  ): Promise<UserWithGroupName[]>;

  /** Conta ativos que casam os filtros (para sinalizar truncamento no export). */
  countForExport(filters: ExportUsersFilters): Promise<number>;
}
