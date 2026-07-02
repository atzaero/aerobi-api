/**
 * Registro central de seeds — ordem importa quando há dependência entre eles.
 * `admin` (conta global) roda antes de `contact` (exemplos Fale Conosco) e
 * `states` (grupos por UF, bandeiras e usuários por função). Cada entrada é um
 * `SeedRunner` definido em `*.seed.ts`.
 */
import { adminSeed } from './admin.seed';
import { contactSeed } from './contact.seed';
import { statesSeed } from './states.seed';
import type { SeedRunner } from './types';

export const seeds: ReadonlyArray<SeedRunner> = [
  adminSeed,
  contactSeed,
  statesSeed,
];

export { adminSeed, contactSeed, statesSeed };
export type { SeedContext, SeedRunner, SeedLogger } from './types';
