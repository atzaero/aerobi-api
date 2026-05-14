#!/bin/sh
set -e

./node_modules/.bin/prisma migrate deploy

# Em prod, seed roda apenas quando explicitamente ligado (`RUN_SEEDS_ON_BOOT=true`)
# — evita aplicar configurações de seed por acidente em ambientes produtivos.
# Para bootstrap inicial em prod: setar a env var no deploy, fazer o primeiro
# release, depois remover.
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
