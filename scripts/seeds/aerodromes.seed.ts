/**
 * Seed `aerodromes` — âncora dos dados de demonstração: **1 aeródromo real por
 * UF** (catálogo `DEV_AERODROMES`, fonte ANAC), pendurado no grupo do estado que
 * o seed `states` criou. Create-only por `(groupId, icao)` — não sobrescreve
 * edições do painel.
 *
 * Ordem: roda **depois** de `states` (precisa do grupo por UF) e **antes** de
 * `cameras` (que pendura nos aeródromos).
 *
 * Guardado por `SEED_DEMO=true`: são dados fictícios, então **não** entram em
 * produção nem em `RUN_SEEDS_ON_BOOT` a menos que explicitamente habilitado.
 */
import { UF_TO_NAME } from './data/brazil-states';
import { DEV_AERODROMES } from './data/dev-aerodromes';
import { ensureSeedAerodrome, resolveStateGroupId } from './lib/aerodromes';
import type { SeedContext, SeedRunner } from './types';

export const aerodromesSeed: SeedRunner = {
  name: 'aerodromes',
  async run({ prisma, logger, env }: SeedContext): Promise<void> {
    if (env.SEED_DEMO?.trim() !== 'true') {
      logger.info(
        '[seed:aerodromes] SEED_DEMO!=true — skip (dados de demonstração).',
      );
      return;
    }

    let created = 0;
    let exists = 0;
    let skipped = 0;

    for (let index = 0; index < DEV_AERODROMES.length; index += 1) {
      const dev = DEV_AERODROMES[index];
      const groupName = `Grupo ${UF_TO_NAME[dev.uf]}`;
      const groupId = await resolveStateGroupId(prisma, dev.uf, groupName);

      if (!groupId) {
        skipped += 1;
        logger.warn(
          `[seed:aerodromes] grupo ausente para ${dev.uf} ("${groupName}") — ` +
            `rode o seed \`states\` antes. Pulando ${dev.icao}.`,
        );
        continue;
      }

      const result = await ensureSeedAerodrome(prisma, groupId, dev, index);
      if (result.result === 'created') {
        created += 1;
      } else {
        exists += 1;
      }
    }

    logger.info(
      `[seed:aerodromes] concluído — criados: ${created}, existentes: ${exists}, ` +
        `pulados (sem grupo): ${skipped} (${DEV_AERODROMES.length} UFs).`,
    );
  },
};
