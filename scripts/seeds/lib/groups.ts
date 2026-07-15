/**
 * Idempotência de grupos de estado. Como `Group.uf` não é único (o
 * produto admite múltiplos grupos por UF), a chave de idempotência do seed é o
 * par determinístico `(uf, name)` entre os ativos — sempre o mais antigo, para
 * ser estável caso um humano crie outro grupo homônimo.
 */
import type { PrismaClient } from '@/generated/prisma/client';
import type { Uf } from '@/generated/prisma/enums';

/** Resultado de garantir um grupo: o id e se foi criado agora. */
export type EnsuredGroup = { id: string; created: boolean };

/**
 * Reusa o grupo ativo `(uf, name)` mais antigo ou cria um novo. Marca a autoria
 * como `seed` para rastreabilidade.
 */
export async function ensureStateGroup(
  prisma: PrismaClient,
  uf: Uf,
  name: string,
): Promise<EnsuredGroup> {
  const existing = await prisma.group.findFirst({
    where: { uf, name, deletedAt: null },
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  });

  if (existing) {
    return { id: existing.id, created: false };
  }

  const created = await prisma.group.create({
    data: { uf, name, createdBy: 'seed' },
    select: { id: true },
  });

  return { id: created.id, created: true };
}
