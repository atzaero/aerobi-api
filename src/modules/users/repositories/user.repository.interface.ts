import type { Uf, User, UserRole } from '@/generated/prisma/client';

/** Dados para criar um User novo (pendente — sem password). */
export interface CreateUserData {
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  /**
   * Grupo de aeródromos do user. `null` para ADMIN global (sem grupo);
   * não-nulo para COORDINATOR/OPERATOR/TECHNICAL. O service resolve a origem
   * (grupo do COORDINATOR ator ou informado pelo ADMIN).
   */
  aerodromeGroupId?: string | null;
  /** UF do grupo. `null` para ADMIN global; alinhado com `aerodromeGroupId`. */
  state?: Uf | null;
  invitedById?: string;
  invitedAt?: Date;
  createdBy?: string;
}

/** Atualização parcial de User — só inclui campos que mudam. */
export interface UpdateUserData {
  name?: string;
  phone?: string | null;
  timezone?: string | null;
  role?: UserRole;
  password?: string | null;
  emailVerified?: boolean;
  acceptedInviteAt?: Date | null;
  lastLoginAt?: Date | null;
  updatedBy?: string;
}

/** Filtros opcionais da listagem paginada (GET /users). */
export interface ListUsersParams {
  skip: number;
  take: number;
  search?: string;
  role?: UserRole;
  /**
   * Restringe a um grupo de aeródromos. Forçado pelo service para COORDINATOR
   * (próprio grupo); ADMIN pode informá-lo livremente como filtro.
   */
  aerodromeGroupId?: string;
}

/** Resultado de listagem paginada — rows + total para construir metadata. */
export interface ListUsersResult {
  rows: User[];
  total: number;
}

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

  findManyPaginated(params: ListUsersParams): Promise<ListUsersResult>;
}
