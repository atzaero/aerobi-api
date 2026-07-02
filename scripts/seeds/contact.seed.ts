/**
 * Seed `contact` — mensagens de exemplo do formulário público Fale Conosco.
 *
 * Sempre incluído em `npm run seed` e `RUN_SEEDS_ON_BOOT`. Create-only por UUID
 * fixo — não sobrescreve status nem soft-delete já alterados no painel. Se
 * `SEED_ADMIN_EMAIL` existir e o admin já estiver no banco, preenche
 * `updatedBy`/`deletedBy` nos exemplos moderados.
 */
import { buildContactSeedExamples } from './data/contact-examples';
import { ensureSeedContact } from './lib/contacts';
import type { SeedContext, SeedRunner } from './types';

export const contactSeed: SeedRunner = {
  name: 'contact',
  async run({ prisma, logger, env }: SeedContext): Promise<void> {
    const adminEmail = env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
    let moderatorUserId: string | null = null;

    if (adminEmail) {
      const admin = await prisma.user.findUnique({
        where: { email: adminEmail },
        select: { id: true },
      });
      moderatorUserId = admin?.id ?? null;
    }

    const examples = buildContactSeedExamples(moderatorUserId);
    let created = 0;
    let exists = 0;

    for (const spec of examples) {
      const result = await ensureSeedContact(prisma, spec);
      if (result === 'created') {
        created += 1;
      } else {
        exists += 1;
      }
    }

    logger.info(
      `[seed:contact] created ${created}, exists ${exists} (${examples.length} total).`,
    );
  },
};
