#!/bin/bash
set -e
echo "Prisma generate..."
npx prisma generate
echo "Prisma migrate deploy..."
npx prisma migrate deploy
echo "Starting Nest (watch)..."
exec npm run start:dev
