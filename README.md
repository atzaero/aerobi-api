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

### Pré-requisito: infra local compartilhada

Os serviços de dado (Postgres, MinIO, Evolution GO) vêm do projeto **[`atzaero/aerobi-local-infra`](https://github.com/atzaero/aerobi-local-infra)** (rede docker `aerobi-local`; portas host `5433`/`9002`/`9003`/`4000`, escolhidas para não colidir com outras infra locais). Suba-a **antes** da API:

```bash
git clone git@github.com:atzaero/aerobi-local-infra && cd aerobi-local-infra
cp .env.example .env && make up
```

### Rodar a API com Docker (watch)

```bash
cp .env.example .env
docker compose -f docker-compose.dev.yml up --build
```

A API anexa-se à rede `aerobi-local` e fala com os serviços pelos hostnames internos. Na primeira vez o script roda `prisma migrate deploy` e sobe o Nest em `--watch`. API: `http://localhost:3333`, Swagger: `http://localhost:3333/api/docs`.

### API local com a imagem de produção (sem watch)

```bash
docker compose -f docker-compose.local.yml up --build
```

### Nest no host (sem Docker na API)

Com a infra local no ar, o Postgres está em `localhost:5433`:

```bash
export DATABASE_URL=postgresql://aerobi:aerobi@localhost:5433/aerobi?schema=public
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

### Autenticação HTTP (API key única)

- Rotas **`/private-aerodromes/*`**, **`/plugfield/*`** e **`/aisweb/*`** exigem header **`X-API-Key`** = **`AEROBI_API_KEY`**, exceto **`NODE_ENV=development`** sem `AEROBI_REQUIRE_AUTH` (bypass para DX). Com `AEROBI_REQUIRE_AUTH=true`, a chave é exigida também em development.
- Rotas **`/rab/*`** usam **JWT** (não X-API-Key): `GET /rab/latest-period` e `GET /rab/rows` exigem permissão `rab:read` (admin/coordinator/operator); `POST /rab/sync` e `GET /rab/sync-state` exigem role `ADMIN`.
- Em produção, `AEROBI_API_KEY` tem de estar definida; caso contrário essas rotas respondem 401.
- No **aerobi-web** (Next), define **`AEROBI_API_KEY`** (ou o valor configurado no hosting) para enviar `X-API-Key` nas chamadas à API.

### Sincronização manual (RAB)

- `POST /rab/sync` — corpo opcional `{ "period": "2026-03", "force": true }`. Requer JWT com role `ADMIN`.

Cron: variável `RAB_SYNC_CRON` (padrão `0 5 * * *`). Desative jobs com `RAB_SYNC_CRON_DISABLED=true`.

### Proxy Plugfield (`/plugfield/*`)

Rotas que encaminham pedidos à API Plugfield (`https://prod-api.plugfield.com.br` por defeito). A autenticação do **cliente** para a Aerobi é a mesma **`X-API-Key`** = **`AEROBI_API_KEY`** (ver acima). As credenciais Plugfield ficam **só no servidor**:

- **`PLUGFIELD_API_KEY`** — enviada à Plugfield como `x-api-key` (obrigatória para chamadas outbound).
- **`PLUGFIELD_TOKEN`** — enviada como `Authorization` nas rotas vendor que exigem Bearer (se o valor não começar por `Bearer `, o prefixo é acrescentado).
- **`PLUGFIELD_API_BASE_URL`** — opcional (default `https://prod-api.plugfield.com.br`).
- **`PLUGFIELD_HTTP_TIMEOUT_MS`** — timeout HTTP em ms (default `8000`).

Endpoints: `GET|POST /plugfield/device`, `GET /plugfield/device/:deviceId`, `GET /plugfield/data/daily`, `GET /plugfield/data/hourly`, `GET /plugfield/data/sensor`. Não há `POST /plugfield/login` na Aerobi — o token é gerido via env. Documentação vendor: [Swagger Plugfield](https://wdg.plugfield.com.br/doc-api/index.html).

### Proxy AISWEB (`/aisweb/*`)

Rotas que consultam serviços AISWEB/DECEA (NOTAM, ROTAER, SOL, Infotemp). O **cliente** usa a mesma **`X-API-Key`** = **`AEROBI_API_KEY`**. As credenciais AISWEB ficam **só no servidor**:

- **`AISWEB_API_KEY`** e **`AISWEB_API_PASS`** — enviadas à AISWEB (obrigatórias para chamadas outbound).
- **`AISWEB_HTTP_TIMEOUT_MS`** — opcional (ver `.env.example`).

### Câmeras + proxy HLS (`/aerodromes/:icao/cameras`, `/streams/*`)

Módulo **`streams`** (épica #317): listagem de câmeras por aeródromo e **proxy HLS** (passthrough de bytes, sem transcoding) do mediamtx do Raspi via tailnet. Desenho **Firestore-first** — o cadastro de câmeras vive no **Firestore** (gerido pelo frontend), **sem** tabela no Postgres nem CRUD neste backend. O **cliente** usa a mesma **`X-API-Key`** = **`AEROBI_API_KEY`** (a visualização é pública; a chave protege a rota server-to-server, detida pelo BFF Next.js).

- `GET /aerodromes/:icao/cameras` — lista as câmeras ativas do aeródromo (lê o Firestore).
- `GET /streams/:cameraId/index.m3u8` e `GET /streams/:cameraId/:segment` — proxy da playlist e dos segmentos HLS.

A config da câmera é resolvida no Firestore **com cache** em memória (não consulta a cada segmento). Variáveis opcionais: **`STREAMS_CAMERA_CACHE_TTL_MS`** (default `60000`), **`STREAMS_PROXY_TIMEOUT_MS`** (default `10000`), **`STREAMS_MEDIAMTX_HLS_PORT`** (default `8888`). Detalhes, diagrama e dicas de debug: [`src/modules/streams/README.md`](src/modules/streams/README.md).

#### Camera Streams — proxy HLS v2 (`/camera-streams/*`, `#473`)

Módulo **`camera-streams`** é o **sucessor** do `streams`: mesmas listagem e proxy HLS, mas lê os metadados de câmera do **Postgres** (módulo `cameras`), não do Firestore. Roda **em paralelo** ao legado (estratégia strangler-fig; o frontend migra no seu ritmo, remoção do legado na #474). Rotas **públicas** (sem `X-API-Key`), com `:cameraId` = **UUID** do Postgres:

- `GET /aerodromes/:icao/camera-streams` — lista as câmeras ativas do aeródromo (lê o Postgres).
- `GET /camera-streams/:cameraId/index.m3u8` e `GET /camera-streams/:cameraId/:segment` — proxy da playlist e dos segmentos HLS.

Variáveis opcionais: **`CAMERA_STREAMS_CACHE_TTL_MS`** (default `60000`), **`CAMERA_STREAMS_PROXY_TIMEOUT_MS`** (default `10000`), **`CAMERA_STREAMS_MEDIAMTX_HLS_PORT`** (default `8888`). Detalhes: [`src/modules/camera-streams/README.md`](src/modules/camera-streams/README.md).

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

# test coverage
$ npm run test:cov
```

## CI, release e deploy

- **CI** (`.github/workflows/ci.yml`): push em `develop` e PRs para `main` / `develop`. Para o GitHub **bloquear merge com CI vermelho**, um admin deve configurar branch protection com checks obrigatórios — ver [`.github/BRANCH_PROTECTION.md`](.github/BRANCH_PROTECTION.md).
- **Dependabot** (`.github/dependabot.yml`): PRs semanais de atualização de dependências npm (revisão humana continua obrigatória).
- **Release** (`.github/workflows/release.yml`): push em `main` → `semantic-release` (precisa do secret `GH_TOKEN` com scope `repo`) → tag e imagem `ghcr.io/<owner>/<repo>:<versão>` e `:latest`, e **deploy** no mesmo ficheiro (job `deploy`): SSH para o servidor, `.env` a partir de secrets, `docker compose -f docker-compose.prod.yml pull && up -d`.

Secrets típicos do deploy: `SSH_PRIVATE_KEY`, `REMOTE_HOST`, `REMOTE_PORT`, `REMOTE_USER`, `REMOTE_TARGET`, `GH_TOKEN`, `DATABASE_URL`, `CORS_ORIGINS`. Para a API em produção: **`AEROBI_API_KEY`**, **`PLUGFIELD_API_KEY`** e **`PLUGFIELD_TOKEN`** (proxy Plugfield), **`AISWEB_API_KEY`** e **`AISWEB_API_PASS`** (proxy AISWEB); opcionais: `AEROBI_REQUIRE_AUTH`, `PLUGFIELD_API_BASE_URL`, `PLUGFIELD_HTTP_TIMEOUT_MS`, `AISWEB_HTTP_TIMEOUT_MS`, `RAB_SYNC_CRON`, etc. — ver comentários no topo de `.github/workflows/release.yml`.

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
