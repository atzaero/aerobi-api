#!/bin/bash
set -e

echo "Prisma generate..."
npx prisma generate
echo "Prisma migrate deploy..."
npx prisma migrate deploy

# Em dev, seed roda por default — o próprio orquestrador é idempotente e
# faz skip silencioso quando não há as envs `SEED_*` configuradas. Setar
# `RUN_SEEDS_ON_BOOT=false` em `.env` desliga explicitamente.
if [ "${RUN_SEEDS_ON_BOOT:-true}" = "true" ]; then
  echo "Running seeds (RUN_SEEDS_ON_BOOT=true; default em dev)..."
  npm run seed
else
  echo "Skipping seeds (RUN_SEEDS_ON_BOOT explicitamente 'false')."
fi

echo "Starting Nest (watch)..."
exec npm run start:dev
