FROM node:22-bookworm-slim AS builder

RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app
COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
RUN npm ci
COPY . .
RUN npx prisma generate && npm run build

FROM node:22-bookworm-slim AS runner

RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates tini \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --gid 1001 nodejs \
  && useradd --uid 1001 --gid nodejs --shell /usr/sbin/nologin --create-home nestjs

WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
RUN npm ci --omit=dev && npx prisma generate
COPY --from=builder /usr/src/app/dist ./dist
# Assets dos seeds (bandeiras PNG) — o `nest build` não copia não-`.ts`; o seed
# os resolve por `__dirname` em `dist/scripts/seeds/assets`.
COPY --from=builder /usr/src/app/scripts/seeds/assets ./dist/scripts/seeds/assets
COPY scripts/start-prod.sh ./scripts/start-prod.sh
RUN chown -R nestjs:nodejs /usr/src/app && chmod +x scripts/start-prod.sh
EXPOSE 3333
USER nestjs
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["./scripts/start-prod.sh"]
