/**
 * Bootstrap do primeiro ADMIN da Aerobi.
 *
 * Idempotente — pode rodar várias vezes; faz upsert por email. Como não há
 * signup público (criação de usuário só por ADMIN via convite), este script
 * é o único caminho para destravar o sistema.
 *
 * Uso:
 *   SEED_ADMIN_EMAIL=admin@aerobi.local \
 *   SEED_ADMIN_PASSWORD='SenhaForte123!' \
 *   SEED_ADMIN_NAME='Admin Aerobi' \
 *   npm run seed:admin
 *
 * Variáveis em .env também são lidas (Node --env-file).
 */
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

import { PrismaClient, UserRole } from '@/generated/prisma/client';

const BCRYPT_COST = 12;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(
      `[seed-admin] Variável de ambiente obrigatória ausente: ${name}`,
    );
  }
  return value.trim();
}

async function main(): Promise<void> {
  const email = requireEnv('SEED_ADMIN_EMAIL').toLowerCase();
  const password = requireEnv('SEED_ADMIN_PASSWORD');
  const name = requireEnv('SEED_ADMIN_NAME');
  const connectionString = requireEnv('DATABASE_URL');

  if (password.length < 8) {
    throw new Error(
      '[seed-admin] SEED_ADMIN_PASSWORD deve ter pelo menos 8 caracteres.',
    );
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
  const now = new Date();

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const existing = await prisma.user.findUnique({ where: { email } });

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        role: UserRole.ADMIN,
        emailVerified: true,
        password: passwordHash,
        acceptedInviteAt: existing?.acceptedInviteAt ?? now,
      },
      create: {
        email,
        name,
        role: UserRole.ADMIN,
        emailVerified: true,
        password: passwordHash,
        acceptedInviteAt: now,
      },
      select: { id: true, email: true, role: true, createdAt: true },
    });

    const action = existing ? 'updated' : 'created';
    console.log(`[seed-admin] ${action} id=${user.id} email=${user.email}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err: unknown) => {
  console.error('[seed-admin] falhou:', err);
  process.exit(1);
});
