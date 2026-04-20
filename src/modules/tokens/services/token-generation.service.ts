import { randomBytes } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcryptjs';

/**
 * Número de rounds (log2) do salt bcrypt.
 *
 * 10 é um bom padrão para 2026: rápido o suficiente para rotas síncronas e
 * resistente a brute-force em hashes de tokens (que têm 256 bits de entropia
 * por si só, mas o hash protege contra vazamento do DB).
 */
const BCRYPT_SALT_ROUNDS = 10;

/**
 * Serviço utilitário para geração e hashing de tokens plain.
 *
 * - `generatePlainToken()` — token aleatório de 32 bytes em base64url
 *   (≈43 chars, URL-safe). Esse valor é enviado ao destinatário (email, SMS)
 *   e **nunca** persistido no banco.
 * - `hashToken(plain)` — calcula o hash bcrypt que vai ao campo `token_hash`.
 * - `compareToken(plain, hash)` — verifica se um plain bate com o hash salvo.
 * - `computeExpiresAt(minutes)` — calcula `Date` no futuro por conveniência.
 */
@Injectable()
export class TokenGenerationService {
  /** Gera um token plain URL-safe de 32 bytes aleatórios (≈256 bits). */
  generatePlainToken(): string {
    return randomBytes(32).toString('base64url');
  }

  /** Calcula o hash bcrypt do token plain. */
  async hashToken(plain: string): Promise<string> {
    return hash(plain, BCRYPT_SALT_ROUNDS);
  }

  /** Compara um token plain com seu hash bcrypt. */
  async compareToken(plain: string, hashed: string): Promise<boolean> {
    return compare(plain, hashed);
  }

  /** Retorna `now + minutes` como `Date`. Útil para `expiresAt`. */
  computeExpiresAt(minutes: number): Date {
    return new Date(Date.now() + minutes * 60_000);
  }
}
