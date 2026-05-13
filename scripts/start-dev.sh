#!/bin/bash
set -e

echo "Prisma generate..."
npx prisma generate
echo "Prisma migrate deploy..."
npx prisma migrate deploy

if [ "${RUN_SEEDS_ON_BOOT:-false}" = "true" ]; then
  echo "Running seeds (RUN_SEEDS_ON_BOOT=true)..."
  npm run seed
else
  echo "Skipping seeds (RUN_SEEDS_ON_BOOT not 'true')."
fi

echo "Starting Nest (watch)..."
exec npm run start:dev
