import bcrypt from 'bcryptjs';

/** Cost factor para bcrypt (2026): rápido em rotas síncronas, resistente a brute force. */
const BCRYPT_COST = 12;

/** Gera o hash bcrypt da senha plain. */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_COST);
}

/** Compara senha plain com hash bcrypt armazenado. */
export async function comparePassword(
  plain: string,
  hashed: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}
