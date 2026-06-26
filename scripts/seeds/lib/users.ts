/**
 * Garantia idempotente de usuários do seed — **create-only**. Se já existe um
 * usuário com o email, é um no-op: o seed nunca sobrescreve `password`, `role`,
 * grupo ou qualquer estado alterado pelo usuário/admin no painel. Isso torna
 * `RUN_SEEDS_ON_BOOT=true` seguro de forma permanente (resolve #227); o seed
 * apenas garante a existência das contas de bootstrap.
 */
import type { PrismaClient } from '@/generated/prisma/client';
import type { Uf, UserRole } from '@/generated/prisma/enums';

import { hashPassword } from './password';

/** Especificação de um usuário a garantir. `password` é o texto puro. */
export type SeedUserSpec = {
  email: string;
  name: string;
  role: UserRole;
  password: string;
  aerodromeGroupId: string | null;
  state: Uf | null;
};

/** `created` quando o usuário foi inserido agora; `exists` quando já havia. */
export type EnsureUserResult = 'created' | 'exists';

/**
 * Cria o usuário se ele ainda não existir (busca por email, normalizado para
 * minúsculas). Já existindo, retorna `exists` sem tocar no registro.
 */
export async function ensureSeedUser(
  prisma: PrismaClient,
  spec: SeedUserSpec,
): Promise<EnsureUserResult> {
  const email = spec.email.toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existing) {
    return 'exists';
  }

  const passwordHash = await hashPassword(spec.password);

  await prisma.user.create({
    data: {
      email,
      name: spec.name,
      role: spec.role,
      password: passwordHash,
      emailVerified: true,
      acceptedInviteAt: new Date(),
      aerodromeGroupId: spec.aerodromeGroupId,
      state: spec.state,
      createdBy: 'seed',
    },
    select: { id: true },
  });

  return 'created';
}
