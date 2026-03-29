#!/bin/bash
set -e
# Com bind mounts, o watcher pode disparar duas vezes seguidas; polling + intervalo ajudam a evitar
# dois processos Nest a escutar na mesma porta (EADDRINUSE). Compose também define CHOKIDAR_*.
export CHOKIDAR_USEPOLLING="${CHOKIDAR_USEPOLLING:-true}"
export CHOKIDAR_INTERVAL="${CHOKIDAR_INTERVAL:-800}"

echo "Prisma generate..."
npx prisma generate
echo "Prisma migrate deploy..."
npx prisma migrate deploy
echo "Starting Nest (watch)..."
exec npm run start:dev
