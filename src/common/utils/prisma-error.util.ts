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
