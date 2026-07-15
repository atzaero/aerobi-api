import { createHash } from 'node:crypto';

/**
 * Hash SHA-256 hex (64 chars) do JWT plain — formato armazenado em
 * `refresh_tokens.token_hash`. Determinístico, sem salt, porque o
 * plain já tem ~256 bits de entropia (assinatura JWT), tornando
 * inviável rainbow-table.
 *
 * SHA-256 (e não bcrypt) é a escolha intencional aqui: precisamos de
 * lookup O(1) por hash; bcrypt forçaria scan linear. Mesmo assim, a
 * busca primária é por `jti` (índice único) — o hash serve como
 * defesa em profundidade caso o DB vaze sem a chave privada JWT.
 */
export function hashRefreshToken(plain: string): string {
  return createHash('sha256').update(plain).digest('hex');
}
