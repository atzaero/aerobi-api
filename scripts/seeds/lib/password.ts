/**
 * Hash de senha dos seeds — bcrypt cost 12, em paridade com o restante do
 * sistema (login compara contra este hash).
 */
import bcrypt from 'bcryptjs';

const BCRYPT_COST = 12;

/** Gera o hash bcrypt de uma senha em texto puro. */
export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_COST);
}
