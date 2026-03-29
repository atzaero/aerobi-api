<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

API **Aerobi** — NestJS + PostgreSQL (Prisma), sincronização do [RAB histórico ANAC](https://sistemas.anac.gov.br/dadosabertos/Aeronaves/RAB/Historico_RAB/) (CSV), cron diário e rotas para o frontend.

### Rodar com Docker (Postgres + API)

```bash
cp .env.example .env
# Ajuste POSTGRES_* e DATABASE_URL se necessário
docker compose -f docker-compose.dev.yml up --build
```

Na primeira vez o script roda `prisma migrate deploy` e sobe o Nest em `--watch`. API: `http://localhost:3333`, Swagger: `http://localhost:3333/api/docs`.

### Postgres + API local (imagem de produção, sem watch)

```bash
docker compose -f docker-compose.local.yml up --build
```

### Migrações e Postgres local (sem Docker na API)

```bash
docker compose -f docker-compose.local.yml up -d postgres
export DATABASE_URL=postgresql://aerobi:aerobi@localhost:5432/aerobi?schema=public
npx prisma migrate deploy
npm run start:dev
```

### Produção (servidor)

- Imagem publicada no GHCR (`release.yml` em `main`).
- No servidor: rede Docker partilhada **`warpgate`** (criada pela infra / Ansible) e Postgres noutro stack na mesma rede; `DATABASE_URL` usa o hostname do container Postgres (ex. `postgres`).
- Ficheiro: **`docker-compose.prod.yml`** — só sobe a API, liga-se à rede `warpgate`, porta publicada em `127.0.0.1` para o Nginx no host.

```bash
# no servidor (após copiar .env com REGISTRY, IMAGE_NAME, TAG, DATABASE_URL, etc.)
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

### Sincronização manual (RAB)

- Todas as rotas **`/rab/*`** (GET `latest-period`, `sync-state`, `rows`, POST `sync`) exigem header **`X-API-Key`** = **`RAB_SYNC_API_KEY`**, exceto **`NODE_ENV=development`** sem `RAB_SYNC_REQUIRE_AUTH` (bypass para DX). Com `RAB_SYNC_REQUIRE_AUTH=true`, a chave é exigida também em development.
- `POST /rab/sync` — corpo opcional `{ "period": "2026-03", "force": true }`.
- Em produção, `RAB_SYNC_API_KEY` tem de estar definida; caso contrário as rotas RAB respondem 401.
- No repositório **aerobi** (Next), usa-se o **mesmo nome** `RAB_SYNC_API_KEY` no `.env` / hosting para enviar `X-API-Key` nas chamadas a `/rab/*`.

Cron: variável `RAB_SYNC_CRON` (padrão `0 5 * * *`). Desative jobs com `RAB_SYNC_CRON_DISABLED=true`.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## CI, release e deploy

- **CI** (`.github/workflows/ci.yml`): push em `develop` e PRs para `main` / `develop`.
- **Release** (`.github/workflows/release.yml`): push em `main` → `semantic-release` (precisa do secret `GH_TOKEN` com scope `repo`) → tag e imagem `ghcr.io/<owner>/<repo>:<versão>` e `:latest`.
- **Deploy** (`.github/workflows/deploy.yml`): ao publicar uma release → SSH para o servidor, `.env` a partir de secrets, `docker compose -f docker-compose.prod.yml pull && up -d`.

Secrets típicos do deploy: `SSH_PRIVATE_KEY`, `REMOTE_HOST`, `REMOTE_PORT`, `REMOTE_USER`, `REMOTE_TARGET`, `GH_TOKEN`, `DATABASE_URL`, `CORS_ORIGINS`; opcionais em `.env.example` / workflow.

Versões e changelog: [Conventional Commits](https://www.conventionalcommits.org/) em `main`; commit de release usa `[skip ci]` para não duplicar CI.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
