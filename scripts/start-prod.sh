#!/bin/sh
set -e

./node_modules/.bin/prisma migrate deploy

if [ "${RUN_SEEDS_ON_BOOT:-false}" = "true" ]; then
  echo "Running seeds (RUN_SEEDS_ON_BOOT=true)..."
  # Imagem prod não tem ts-node (npm ci --omit=dev), então invoca o JS
  # compilado pelo nest build. Para filtrar um seed específico:
  #   node dist/scripts/run-seeds.js users
  node dist/scripts/run-seeds.js
else
  echo "Skipping seeds (RUN_SEEDS_ON_BOOT not 'true')."
fi

exec node dist/src/main.js
