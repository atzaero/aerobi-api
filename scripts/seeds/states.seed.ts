/**
 * Seed `states` — para cada uma das 27 UFs, de forma idempotente e coesa:
 * garante o grupo (`Grupo <Estado>`), sobe a bandeira do estado como imagem do
 * grupo e cria os usuários de cada função (coordenador/operador/técnico).
 *
 * Configurado por envs:
 *   SEED_DEFAULT_PASSWORD='...'        # >= 8, senha de todos os não-admin
 *   SEED_EMAIL_DOMAIN=aerobi.com.br    # opcional (default aerobi.com.br)
 *   SEED_COORDINATORS_PER_STATE=1      # opcional (inteiro >= 0; default 1)
 *   SEED_OPERATORS_PER_STATE=1
 *   SEED_TECHNICALS_PER_STATE=1
 *
 * Requer também `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY` e `MINIO_SECRET_KEY`
 * (upload das bandeiras) — `buildSeedStorage` falha cedo se faltarem.
 *
 * Emails (inglês/role): o 1º da função sem sufixo, do 2º em diante com `_n`
 * (`coordinator_pi@`, `coordinator_pi_2@`) — assim aumentar a contagem só
 * adiciona novos. Sem `SEED_DEFAULT_PASSWORD` o runner é skip silencioso.
 */
import { Uf } from '@/generated/prisma/enums';

import { ALL_UFS, STATE_ROLE_SPECS, UF_TO_NAME } from './data/brazil-states';
import { parseCount, parseEmailDomain, requirePassword } from './lib/env';
import { ensureGroupFlag } from './lib/group-image';
import { ensureStateGroup } from './lib/groups';
import { buildSeedStorage } from './lib/storage';
import { ensureSeedUser } from './lib/users';
import type { SeedContext, SeedRunner } from './types';

/**
 * Monta o local-part do email: `${label}_${uf}` para o primeiro da função e
 * `${label}_${uf}_${n}` a partir do segundo.
 */
function buildEmail(
  label: string,
  uf: Uf,
  index: number,
  domain: string,
): string {
  const suffix = index === 1 ? '' : `_${index}`;
  return `${label}_${uf.toLowerCase()}${suffix}@${domain}`;
}

/** Nome de exibição: `"<Label> - <Estado>"`, com ` <n>` a partir do segundo. */
function buildDisplayName(
  label: string,
  stateName: string,
  index: number,
): string {
  const suffix = index === 1 ? '' : ` ${index}`;
  return `${label}${suffix} - ${stateName}`;
}

export const statesSeed: SeedRunner = {
  name: 'states',
  async run({ prisma, logger, env }: SeedContext): Promise<void> {
    if (!env.SEED_DEFAULT_PASSWORD?.trim()) {
      logger.info('[seed:states] SEED_DEFAULT_PASSWORD ausente — skip.');
      return;
    }

    const password = requirePassword(env, 'SEED_DEFAULT_PASSWORD');
    const domain = parseEmailDomain(env, 'SEED_EMAIL_DOMAIN');
    const roleCounts = STATE_ROLE_SPECS.map((spec) => ({
      spec,
      count: parseCount(env, spec.countEnv, 1),
    }));

    const storage = buildSeedStorage(env);

    let groupsCreated = 0;
    let flagsUploaded = 0;
    let usersCreated = 0;

    for (const uf of ALL_UFS) {
      const stateName = UF_TO_NAME[uf];
      const group = await ensureStateGroup(prisma, uf, `Grupo ${stateName}`);
      if (group.created) {
        groupsCreated += 1;
      }

      const flag = await ensureGroupFlag(prisma, storage, group.id, uf, logger);
      if (flag === 'uploaded') {
        flagsUploaded += 1;
      }

      for (const { spec, count } of roleCounts) {
        for (let index = 1; index <= count; index += 1) {
          const result = await ensureSeedUser(prisma, {
            email: buildEmail(spec.emailLabel, uf, index, domain),
            name: buildDisplayName(spec.displayLabel, stateName, index),
            role: spec.role,
            password,
            groupId: group.id,
            state: uf,
          });
          if (result === 'created') {
            usersCreated += 1;
          }
        }
      }
    }

    logger.info(
      `[seed:states] concluído — grupos criados: ${groupsCreated}, ` +
        `bandeiras enviadas: ${flagsUploaded}, usuários criados: ${usersCreated}.`,
    );
  },
};
