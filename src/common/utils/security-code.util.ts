const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 8;

/**
 * Gera um código de segurança de 8 caracteres (maiúsculas + dígitos, sem
 * ambíguos O/0/I/1) para acesso público à intervenção de manutenção.
 */
export function generateSecurityCode(): string {
  const bytes = new Uint8Array(CODE_LENGTH);
  crypto.getRandomValues(bytes);
  let result = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    result += ALPHABET.charAt(bytes[i] % ALPHABET.length);
  }
  return result;
}
