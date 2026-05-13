import type { RefreshToken } from '@/generated/prisma/client';

/**
 * Dados necessários para persistir um novo refresh token.
 *
 * - `tokenHash` é SHA-256 do JWT plain (o plain só vai ao cliente)
 * - `jti` é o JWT id assinado no claim — único globalmente, permite revogar
 *   um token específico sem afetar outros do mesmo usuário
 */
export interface CreateRefreshTokenData {
  jti: string;
  tokenHash: string;
  userId: string;
  expiresAt: Date;
  userAgent?: string;
  ipAddress?: string;
}

/**
 * Contrato do repositório de refresh tokens.
 *
 * Refresh é considerado **ativo** quando: `deletedAt === null`,
 * `revoked === false` e `expiresAt > now()`.
 *
 * A rotação encadeada (criar novo + revogar antigo + linkar
 * `replaced_by_id`) é atômica via transação.
 */
export interface IRefreshTokenRepository {
  create(data: CreateRefreshTokenData): Promise<RefreshToken>;

  /**
   * Busca por `jti` independentemente de estado — usado pela rotação
   * para distinguir "não encontrado" vs "já revogado" (detecção de
   * reuso).
   */
  findByJti(jti: string): Promise<RefreshToken | null>;

  /**
   * Rotação atômica: marca o token de origem como `revoked` + `replaced_by`,
   * cria o novo registro e devolve ele. Lança erro se algum dos lados falhar.
   */
  rotate(params: {
    currentId: string;
    newToken: CreateRefreshTokenData;
  }): Promise<RefreshToken>;

  /** Revoga um único refresh por id (logout específico). */
  revokeById(id: string): Promise<void>;

  /**
   * Revoga todos os refresh ativos de um usuário — usado em:
   *  - logout global
   *  - mudança de senha
   *  - **detecção de reuso de refresh** (kill switch da família)
   */
  revokeAllForUser(userId: string): Promise<number>;
}

/** Injection token para DI do Nest. */
export const REFRESH_TOKEN_REPOSITORY = Symbol('IRefreshTokenRepository');
