/**
 * Idempotência dos aeródromos de demonstração — **create-only** pela chave
 * `(groupId, icao)` entre ativos (mesma unicidade parcial da tabela). Se já
 * existe, é no-op: o seed nunca sobrescreve status, observação ou soft-delete
 * feitos no painel. O grupo de cada UF é resolvido a partir do que o seed
 * `states` criou.
 */
import type { PrismaClient } from '@/generated/prisma/client';
import type { Uf } from '@/generated/prisma/enums';

import type { DevAerodrome } from '../data/dev-aerodromes';

/** `created` quando inserido agora; `exists` quando já havia. */
export type EnsureAerodromeResult = 'created' | 'exists';

/** Aeródromo garantido: id (para pendurar câmeras), ICAO e o desfecho. */
export type SeededAerodrome = {
  id: string;
  icao: string;
  result: EnsureAerodromeResult;
};

/** Toggles de status de um aeródromo de demonstração. */
export type AerodromeDemoStatus = {
  isOpen: boolean;
  isView: boolean;
  construction: boolean;
  lit: boolean;
  fueling: boolean;
};

/**
 * Deriva status variados a partir do índice — variedade **estável** (sem
 * aleatoriedade) para exercitar KPIs e filtros da admin/mapa. `isView` é sempre
 * `true` (é demonstração; queremos os pontos visíveis no mapa público).
 */
export function deriveAerodromeDemoStatus(index: number): AerodromeDemoStatus {
  return {
    isOpen: index % 5 !== 0,
    isView: true,
    construction: index % 7 === 0,
    lit: index % 2 === 0,
    fueling: index % 3 === 0,
  };
}

/**
 * Resolve o grupo do estado criado pelo seed `states`: o par `(uf, name)` ativo
 * mais antigo (mesma convenção de `ensureStateGroup`). Retorna `null` quando o
 * grupo ainda não existe — sinal de que o seed `states` não rodou.
 */
export async function resolveStateGroupId(
  prisma: PrismaClient,
  uf: Uf,
  name: string,
): Promise<string | null> {
  const group = await prisma.group.findFirst({
    where: { uf, name, deletedAt: null },
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  });
  return group?.id ?? null;
}

/**
 * Cria o aeródromo se ainda não existir a chave `(groupId, icao)` entre ativos.
 * Já existindo, retorna `exists` sem tocar no registro. `createdBy: 'seed'` para
 * rastreabilidade.
 */
export async function ensureSeedAerodrome(
  prisma: PrismaClient,
  groupId: string,
  dev: DevAerodrome,
  index: number,
): Promise<SeededAerodrome> {
  const existing = await prisma.aerodrome.findFirst({
    where: { groupId, icao: dev.icao, deletedAt: null },
    select: { id: true },
  });
  if (existing) {
    return { id: existing.id, icao: dev.icao, result: 'exists' };
  }

  const status = deriveAerodromeDemoStatus(index);
  const created = await prisma.aerodrome.create({
    data: {
      group: { connect: { id: groupId } },
      icao: dev.icao,
      name: dev.name,
      municipality: dev.municipality,
      latitude: dev.latitude,
      longitude: dev.longitude,
      altitude: dev.altitude,
      isOpen: status.isOpen,
      isView: status.isView,
      construction: status.construction,
      lit: status.lit,
      fueling: status.fueling,
      createdBy: 'seed',
    },
    select: { id: true },
  });

  return { id: created.id, icao: dev.icao, result: 'created' };
}
