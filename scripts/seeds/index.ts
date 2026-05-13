/**
 * Registro central de seeds — ordem importa quando há dependência entre
 * eles (ex: um seed que precisa de usuários já criados roda depois de
 * `users`). Cada entrada é um `SeedRunner` definido em `*.seed.ts`.
 */
import type { SeedRunner } from './types';

import { usersSeed } from './users.seed';

export const seeds: ReadonlyArray<SeedRunner> = [usersSeed];

export { usersSeed };
export type { SeedContext, SeedRunner, SeedLogger } from './types';
