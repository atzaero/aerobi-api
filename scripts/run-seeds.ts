/**
 * Entrypoint dos seeds — instancia o `PrismaClient` (com adapter-pg)
 * e executa cada `SeedRunner` registrado em `scripts/seeds/index.ts`.
 *
 * Filtragem opcional por nome via argv: `npm run seed -- users` roda
 * apenas o seed `users`. Sem argumentos, roda todos em ordem.
 *
 * Idempotente — todos os runners devem usar `upsert` ou
 * `createMany({ skipDuplicates: true })` para que rodar múltiplas vezes
 * (inclusive em todo boot via `RUN_SEEDS_ON_BOOT=true`) não cause efeitos
 * colaterais nem erros.
 */
import { PrismaPg } from '@prisma/adapter-pg';

import { getErrorMessage } from '@/common/utils/error.util';
import { PrismaClient } from '@/generated/prisma/client';

import { seeds } from './seeds';
import type { SeedLogger } from './seeds/types';

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error('[seeds] DATABASE_URL ausente no ambiente.');
  }
  return url;
}

const logger: SeedLogger = {
  info: (msg) => console.log(msg),
  warn: (msg) => console.warn(msg),
  error: (msg) => console.error(msg),
};

async function main(): Promise<void> {
  const filterNames = process.argv.slice(2).map((arg) => arg.toLowerCase());

  const runners = filterNames.length
    ? seeds.filter((s) => filterNames.includes(s.name.toLowerCase()))
    : seeds;

  if (filterNames.length && runners.length === 0) {
    throw new Error(
      `[seeds] nenhum seed corresponde aos filtros: ${filterNames.join(', ')}. ` +
        `Disponíveis: ${seeds.map((s) => s.name).join(', ')}.`,
    );
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: requireDatabaseUrl() }),
  });

  try {
    for (const seed of runners) {
      logger.info(`[seeds] iniciando ${seed.name}`);
      await seed.run({ prisma, logger, env: process.env });
    }
    logger.info(`[seeds] concluído (${runners.length} runner(s)).`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err: unknown) => {
  logger.error(`[seeds] falhou: ${getErrorMessage(err)}`);
  if (err instanceof Error && err.stack) {
    logger.error(err.stack);
  }
  process.exit(1);
});
