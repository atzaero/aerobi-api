import { Prisma } from '@/generated/prisma/client';

/**
 * `true` se `err` é o conflito de serialização do Postgres (Prisma `P2034`):
 * uma transação `Serializable` abortada por escrita concorrente. Não há
 * inconsistência de dados — é seguro retentar a transação inteira.
 */
export function isSerializationConflict(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2034'
  );
}

/**
 * `true` se `err` é a violação de unicidade do Postgres (Prisma `P2002`): uma
 * escrita que colide com um índice `@unique` (ex.: `@@unique([groupId, icao])`
 * do aeródromo). A constraint do banco é a garantia final contra a corrida entre
 * a checagem prévia e o `create`/`update`.
 *
 * Detecta por **duck-typing do `code`** (não por `instanceof`, ao contrário de
 * `isSerializationConflict`) de propósito: espelha o padrão já usado em
 * `users/update-user.service.ts`, não acopla ao tipo do client gerado e permite
 * que os specs dos services mockem o erro como um simples `{ code: 'P2002' }`.
 * `P2002` é um código específico o bastante para que a colisão acidental com um
 * objeto não-Prisma seja irrelevante.
 */
export function isUniqueConstraintError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    (err as { code?: unknown }).code === 'P2002'
  );
}
