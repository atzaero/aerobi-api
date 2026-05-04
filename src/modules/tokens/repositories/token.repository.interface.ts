import type { Prisma, Token } from '@/generated/prisma/client';
import type { TokenType } from '@/generated/prisma/enums';

/**
 * Dados necessários para persistir um novo token.
 *
 * `tokenHash` deve ser o hash bcrypt do token plain (o plain nunca é
 * persistido — é enviado ao destinatário final: email, SMS, etc.).
 */
export interface CreateTokenData {
  subjectId: string;
  type: TokenType;
  tokenHash: string;
  expiresAt: Date;
  metadata?: Prisma.InputJsonValue;
  createdBy?: string;
}

/**
 * Contrato do repositório de tokens genéricos.
 *
 * O token é considerado ativo quando:
 * - `deletedAt === null`
 * - `used === false`
 * - `expiresAt > now()`
 */
export interface ITokenRepository {
  create(data: CreateTokenData): Promise<Token>;

  /** Retorna o token ativo mais recente do subject para um dado `type`. */
  findActiveBySubjectAndType(
    subjectId: string,
    type: TokenType,
  ): Promise<Token | null>;

  /** Retorna um token ativo cujo `token_hash` bata exatamente com o argumento. */
  findByHash(tokenHash: string): Promise<Token | null>;

  /** Marca um token como usado (sem soft-delete). */
  markAsUsed(id: string, updatedBy?: string): Promise<Token>;

  /**
   * Invalida (soft-delete + `used: true`) todos os tokens ativos do subject
   * para um dado `type`. Usado antes de emitir um novo token do mesmo tipo.
   */
  invalidateBySubjectAndType(
    subjectId: string,
    type: TokenType,
    updatedBy?: string,
  ): Promise<void>;
}

/**
 * Injection token (Symbol) para injetar `ITokenRepository` via DI do Nest.
 *
 * @example
 * ```ts
 * constructor(@Inject(TOKEN_REPOSITORY) private readonly repo: ITokenRepository) {}
 * ```
 */
export const TOKEN_REPOSITORY = Symbol('ITokenRepository');
