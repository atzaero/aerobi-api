/**
 * Registro central de seeds — ordem importa quando há dependência entre eles.
 * `admin` (conta global) roda antes de `contact` (exemplos Fale Conosco) e
 * `states` (grupos por UF, bandeiras e usuários por função). Os seeds de
 * demonstração `aerodromes` e `cameras` fecham a lista, nessa ordem: `aerodromes`
 * pendura no grupo por UF criado por `states`; `cameras` pendura nos aeródromos.
 * Ambos são guardados por `SEED_DEMO=true`. Cada entrada é um `SeedRunner`
 * definido em `*.seed.ts`.
 */
import { adminSeed } from './admin.seed';
import { aerodromesSeed } from './aerodromes.seed';
import { camerasSeed } from './cameras.seed';
import { contactSeed } from './contact.seed';
import { statesSeed } from './states.seed';
import type { SeedRunner } from './types';

export const seeds: ReadonlyArray<SeedRunner> = [
  adminSeed,
  contactSeed,
  statesSeed,
  aerodromesSeed,
  camerasSeed,
];

export { adminSeed, contactSeed, statesSeed, aerodromesSeed, camerasSeed };
export type { SeedContext, SeedRunner, SeedLogger } from './types';
