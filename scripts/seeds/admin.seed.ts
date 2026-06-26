/**
 * Seed `admin` — garante a conta ADMIN global (sem grupo, escopo total).
 *
 * Configurado por envs dedicadas:
 *   SEED_ADMIN_EMAIL=admin@aerobi.com.br
 *   SEED_ADMIN_PASSWORD='...'     # >= 8 caracteres
 *   SEED_ADMIN_NAME='Admin'       # opcional (default "Admin")
 *
 * Sem `SEED_ADMIN_EMAIL` o runner é skip silencioso (permite boot idempotente
 * sem forçar config). Create-only: não reseta a senha de um admin já existente.
 */
import { UserRole } from '@/generated/prisma/enums';

import { optionalString, requirePassword } from './lib/env';
import { ensureSeedUser } from './lib/users';
import type { SeedContext, SeedRunner } from './types';

export const adminSeed: SeedRunner = {
  name: 'admin',
  async run({ prisma, logger, env }: SeedContext): Promise<void> {
    const email = env.SEED_ADMIN_EMAIL?.trim();
    if (!email) {
      logger.info('[seed:admin] SEED_ADMIN_EMAIL ausente — skip.');
      return;
    }

    const password = requirePassword(env, 'SEED_ADMIN_PASSWORD');
    const name = optionalString(env, 'SEED_ADMIN_NAME', 'Admin');

    const result = await ensureSeedUser(prisma, {
      email,
      name,
      role: UserRole.ADMIN,
      password,
      aerodromeGroupId: null,
      state: null,
    });

    logger.info(`[seed:admin] ${result} ${email.toLowerCase()} (ADMIN).`);
  },
};
