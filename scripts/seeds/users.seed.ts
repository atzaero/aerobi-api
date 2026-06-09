/**
 * Seed de usuários — bootstrap inicial de contas.
 *
 * Sem signup público na Aerobi, este é o único caminho para destravar o
 * sistema. Idempotente via `upsert` por email; pode rodar várias vezes.
 *
 * Configuração via env (lista indexada — adicionar novos blocos
 * incrementando o índice; o parser para no primeiro `SEED_USER_<N>_EMAIL`
 * ausente):
 *
 *   SEED_USER_1_EMAIL=admin@aerobi.local
 *   SEED_USER_1_PASSWORD='AdmTrocar123!'
 *   SEED_USER_1_NAME='Admin Aerobi'
 *   SEED_USER_1_ROLE=ADMIN
 *
 *   SEED_USER_2_EMAIL=coordenador@aerobi.local
 *   SEED_USER_2_PASSWORD='CoordTrocar123!'
 *   SEED_USER_2_NAME='Coordenador'
 *   SEED_USER_2_ROLE=COORDINATOR
 *   SEED_USER_2_AERODROME_GROUP_ID='wyAxumH2-...-UUID' # opcional
 *   SEED_USER_2_STATE=PI                               # opcional (Uf)
 *
 * Cada bloco precisa ter os 4 campos obrigatórios (email/password/name/
 * role); se faltar algum, o seed falha em vez de criar usuário incompleto.
 * `AERODROME_GROUP_ID` (UUID de um `AerodromeGroup` existente) e `STATE`
 * (sigla de UF) são opcionais — ADMIN global fica sem grupo (`null`).
 *
 * Sem nenhuma variável `SEED_USER_*` definida o seed é skip silencioso
 * (apenas log informativo) — permite rodar `RUN_SEEDS_ON_BOOT=true` em
 * produção sem forçar configuração de seed quando ele não é desejado.
 */
import bcrypt from 'bcryptjs';

import { Uf, UserRole } from '@/generated/prisma/client';

import type { SeedContext, SeedRunner } from './types';

const BCRYPT_COST = 12;
const MIN_PASSWORD_LENGTH = 8;

type SeedUserSpec = {
  index: number;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  aerodromeGroupId: string | null;
  state: Uf | null;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function parseRole(raw: string, index: number): UserRole {
  const upper = raw.trim().toUpperCase();
  if (!(upper in UserRole)) {
    throw new Error(
      `[seed:users] SEED_USER_${index}_ROLE inválida: "${raw}". ` +
        `Valores aceitos: ${Object.values(UserRole).join(', ')}.`,
    );
  }
  return upper as UserRole;
}

function parseState(raw: string, index: number): Uf {
  const upper = raw.trim().toUpperCase();
  if (!(upper in Uf)) {
    throw new Error(
      `[seed:users] SEED_USER_${index}_STATE inválida: "${raw}". ` +
        `Valores aceitos: ${Object.values(Uf).join(', ')}.`,
    );
  }
  return upper as Uf;
}

function parseAerodromeGroupId(raw: string, index: number): string {
  const value = raw.trim();
  if (!UUID_RE.test(value)) {
    throw new Error(
      `[seed:users] SEED_USER_${index}_AERODROME_GROUP_ID inválido: ` +
        `"${raw}". Esperado um UUID.`,
    );
  }
  return value;
}

function parseSeedUsers(env: NodeJS.ProcessEnv): SeedUserSpec[] {
  const users: SeedUserSpec[] = [];

  for (let i = 1; ; i++) {
    const prefix = `SEED_USER_${i}_`;
    const email = env[`${prefix}EMAIL`]?.trim();

    if (!email) {
      // Para no primeiro índice sem email — convenção: lista contígua começando em 1.
      break;
    }

    const password = env[`${prefix}PASSWORD`];
    const name = env[`${prefix}NAME`]?.trim();
    const roleRaw = env[`${prefix}ROLE`]?.trim();

    if (!password || !name || !roleRaw) {
      throw new Error(
        `[seed:users] Configuração incompleta para SEED_USER_${i}_*: ` +
          `email/password/name/role são todos obrigatórios.`,
      );
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new Error(
        `[seed:users] SEED_USER_${i}_PASSWORD tem menos de ` +
          `${MIN_PASSWORD_LENGTH} caracteres.`,
      );
    }

    const aerodromeGroupIdRaw = env[`${prefix}AERODROME_GROUP_ID`]?.trim();
    const stateRaw = env[`${prefix}STATE`]?.trim();

    users.push({
      index: i,
      email: email.toLowerCase(),
      password,
      name,
      role: parseRole(roleRaw, i),
      aerodromeGroupId: aerodromeGroupIdRaw
        ? parseAerodromeGroupId(aerodromeGroupIdRaw, i)
        : null,
      state: stateRaw ? parseState(stateRaw, i) : null,
    });
  }

  // Detecta duplicidade de email entre os specs antes de bater no DB.
  const seen = new Set<string>();
  for (const user of users) {
    if (seen.has(user.email)) {
      throw new Error(
        `[seed:users] Email duplicado na configuração: ${user.email}.`,
      );
    }
    seen.add(user.email);
  }

  return users;
}

export const usersSeed: SeedRunner = {
  name: 'users',
  async run({ prisma, logger, env }: SeedContext): Promise<void> {
    const specs = parseSeedUsers(env);

    if (specs.length === 0) {
      logger.info('[seed:users] nenhum SEED_USER_<N>_* configurado — skip.');
      return;
    }

    logger.info(`[seed:users] aplicando ${specs.length} usuário(s)...`);
    const now = new Date();

    for (const spec of specs) {
      const existing = await prisma.user.findUnique({
        where: { email: spec.email },
        select: { id: true, acceptedInviteAt: true },
      });

      const passwordHash = await bcrypt.hash(spec.password, BCRYPT_COST);

      const user = await prisma.user.upsert({
        where: { email: spec.email },
        update: {
          name: spec.name,
          role: spec.role,
          emailVerified: true,
          password: passwordHash,
          acceptedInviteAt: existing?.acceptedInviteAt ?? now,
          aerodromeGroupId: spec.aerodromeGroupId,
          state: spec.state,
        },
        create: {
          email: spec.email,
          name: spec.name,
          role: spec.role,
          emailVerified: true,
          password: passwordHash,
          acceptedInviteAt: now,
          aerodromeGroupId: spec.aerodromeGroupId,
          state: spec.state,
        },
        select: { id: true, email: true, role: true },
      });

      const action = existing ? 'updated' : 'created';
      logger.info(
        `[seed:users] ${action} idx=${spec.index} id=${user.id} ` +
          `email=${user.email} role=${user.role}`,
      );
    }

    logger.info('[seed:users] concluído.');
  },
};
