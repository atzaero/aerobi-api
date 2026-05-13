/**
 * Contrato dos seeds do aerobi-api.
 *
 * Cada arquivo `*.seed.ts` exporta um `SeedRunner` com nome e função idempotente
 * (segura para rodar várias vezes — preferir `upsert` ou `skipDuplicates`).
 * O orquestrador em `scripts/seeds/index.ts` lista os runners na ordem de
 * execução desejada.
 *
 * Os seeds podem ser disparados:
 *  - Sob demanda:        `npm run seed`                  (todos)
 *  - Granular:           `npm run seed:users`            (apenas users)
 *  - No boot dos starts: `RUN_SEEDS_ON_BOOT=true` em
 *                        `scripts/start-dev.sh` / `scripts/start-prod.sh`.
 */
import type { PrismaClient } from '@/generated/prisma/client';

export type SeedLogger = {
  info: (msg: string) => void;
  warn: (msg: string) => void;
  error: (msg: string) => void;
};

export type SeedContext = {
  prisma: PrismaClient;
  logger: SeedLogger;
  env: NodeJS.ProcessEnv;
};

export type SeedRunner = {
  /** Identificador curto, usado nos logs (`[seed:<name>] ...`). */
  name: string;
  /** Implementação idempotente do seed. */
  run: (ctx: SeedContext) => Promise<void>;
};
