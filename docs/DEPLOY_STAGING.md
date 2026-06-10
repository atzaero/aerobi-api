# Deploy — Staging (semantic-release prerelease)

Caminho de **staging** automático, espelhando produção, sem quebrar o fluxo de
produção existente.

## Visão geral

| Branch | semantic-release | Tag | Deploy | Ambiente |
|---|---|---|---|---|
| `develop` | prerelease `beta` | `vX.Y.Z-beta.N` | automático | **staging** |
| `main` | estável | `vX.Y.Z` | automático | **produção** (inalterado) |

- Config: [`.releaserc.json`](../.releaserc.json) → `"branches": ["main", { "name": "develop", "prerelease": "beta" }]`.
- Workflows:
  - [`.github/workflows/release.yml`](../.github/workflows/release.yml) — `release` (semantic-release, decide `is_prerelease`) → `docker` (build/push GHCR) → `deploy-production` **ou** `deploy-staging`.
  - [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) — **workflow reutilizável** (`workflow_call`) que faz o deploy SSH, parametrizado por ambiente (compose, env_file, `project_name`, guard). Os dois jobs de deploy do `release.yml` apenas o invocam com `secrets: inherit`, eliminando duplicação.
- **Mesma imagem GHCR** roda nos dois ambientes; só muda a env de runtime (NestJS lê config em runtime). Staging usa `docker compose -p staging -f docker-compose.staging.yml`.

## Portas — fonte da verdade no Ansible

As portas **não são inventadas aqui**. Vêm de
`aerobi-ansible/inventory/prod/group_vars/all/ports.yml` (`app_ports`):

| Ambiente | App | Host bind | Container |
|---|---|---|---|
| prod | aerobi-api | 3333 | 3333 |
| staging | aerobi-api | **3433** | 3333 |

Convenção do Ansible: `staging = prod + 100`. O Nginx (vhost `setup_staging.yml`)
faz proxy `api.staging.aerobi.com.br → 127.0.0.1:3433`.

Infra de staging já provisionada pelo projeto Ansible (`playbooks/setup_staging.yml`
+ `setup_app_databases.yml`): vhost + SSL, banco `aerobi_staging`
(user `aerobi_staging_user`), diretório `/home/deploy/apps/aerobi-api-staging`.

## GitHub Environments

Dois Environments: **`production`** e **`staging`**, cada um com **as suas
próprias** variables e secrets. Conexão SSH é a MESMA VPS → fica repo-level.

### Repo-level secrets (conexão SSH, compartilhados)

`GH_TOKEN`, `SSH_PRIVATE_KEY`, `REMOTE_HOST`, `REMOTE_PORT`, `REMOTE_USER`.

> A maioria dos secrets de **aplicação** repo-level (`DATABASE_URL`,
> `AEROBI_API_KEY`, …) tornou-se redundante após a migração para o Environment
> `production` (ambos os Environments têm override próprio) e pode ser removida.
> **Exceção:** `AVIASCAN_*` continua a existir **só no repo-level** — é a única
> fonte para os dois ambientes (ver matriz abaixo); não remover sem antes criar
> override por Environment.

### Variables por Environment (não sensível)

| Variable | `production` | `staging` | Origem |
|---|---|---|---|
| `REMOTE_TARGET` | `/home/deploy/apps/aerobi-api` | `/home/deploy/apps/aerobi-api-staging` | Ansible |
| `HOST_PORT` | `3333` | `3433` | Ansible `ports.yml` |

### Matriz definitiva: secret × ambiente

Mesmos **nomes** nos dois Environments, **valores** diferentes onde a coluna
"Política" diz `divergir`. Snapshot auditado em **2026-06-10** (apenas nomes; o
`gh secret list` não expõe valores). Como os nomes são compartilhados, um secret
**ausente** num Environment cai para o valor **repo-level** (= produção) — daí a
classificação abaixo distinguir o que *precisa* de override próprio.

Legenda da política:
- **divergir** — DEVE ter valor próprio em cada Environment; fallback acidental
  para prod é um bug. Onde possível, coberto pelo guard anti-fallback.
- **compartilhar** — mesmo valor nos dois ambientes é aceitável de propósito
  (upstream de terceiros idêntico, URL pública, constante).

| Secret | production | staging | Política | Guard? | Notas |
|---|:---:|:---:|---|:---:|---|
| `DATABASE_URL` | ✅ | ✅ | **divergir** | ✅ banco | banco `aerobi` vs `aerobi_staging` (senha no ansible-vault) |
| `CORS_ORIGINS` | ✅ | ✅ | **divergir** | ✅ `staging` | origem prod vs `https://staging.aerobi.com.br` |
| `FRONTEND_URL` | ✅ | ✅ | **divergir** | ✅ `staging` | links de convite/reset por e-mail |
| `AEROBI_API_KEY` | ✅ | ✅ | **divergir** | ❌ opaco | chave `X-API-Key` distinta por ambiente |
| `JWT_SECRET_PRIVATE_KEY` / `JWT_SECRET_PUBLIC_KEY` | ✅ | ✅ | **divergir** | ❌ opaco | par de chaves isolado (token de staging não vale em prod) |
| `MINIO_ENDPOINT` / `MINIO_PUBLIC_ENDPOINT` | ✅ | ✅ | **divergir** | ❌ opaco | endpoint/bucket isolados — não escrever no storage de prod |
| `MINIO_BUCKET_READINGS` | ✅ | ✅ | **divergir** | ❌ opaco | bucket próprio de staging |
| `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` | ✅ | ✅ | divergir¹ | ❌ opaco | ¹pode compartilhar se o MinIO for o mesmo com bucket distinto |
| `MAIL_USER_NO_REPLY` | ✅ | ✅ | divergir¹ | ❌ opaco | ¹remetente próprio evita e-mail de staging parecer prod |
| `MAIL_HOST` / `MAIL_USER` / `MAIL_PASS` | ✅ | ✅ | compartilhar | ❌ | mesmo SMTP aceitável |
| `FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` | ✅ | ✅ | divergir¹ | ❌ opaco | ¹idealmente projeto Firebase de staging; compartilhar só se intencional |
| `STORAGE_PROVIDER` | ✅ | ✅ | compartilhar | ❌ | mesma config (`minio`) |
| `PLUGFIELD_API_KEY` / `PLUGFIELD_TOKEN` | ✅ | ✅ | compartilhar | ❌ | upstream Plugfield idêntico |
| `AISWEB_API_KEY` / `AISWEB_API_PASS` | ✅ | ✅ | compartilhar | ❌ | upstream AISWEB/DECEA idêntico |
| `ANAC_RAB_INDEX_URL` / `HTTP_USER_AGENT` | ✅ | ✅ | compartilhar | ❌ | URL pública ANAC + constante |
| `AVIASCAN_API_BASE_URL` / `AVIASCAN_HTTP_TIMEOUT_MS` | ⬇️ | ⬇️ | compartilhar | ❌ | **só repo-level** — ver nota AviaScan abaixo |
| `SEED_USER_1_*` / `SEED_USER_2_*` (8) | ❌ | ✅ | n/a | ❌ | bootstrap só em staging — ver nota SEED abaixo (#227) |

Legenda de presença: ✅ override próprio no Environment · ⬇️ herdado do
repo-level (sem override) · ❌ ausente.

> Opcionais (mesmos nomes, se aplicável): `AEROBI_REQUIRE_AUTH`,
> `PLUGFIELD_API_BASE_URL`, `PLUGFIELD_HTTP_TIMEOUT_MS`, `AISWEB_HTTP_TIMEOUT_MS`,
> `RAB_SYNC_CRON`, `RAB_SYNC_CRON_DISABLED`, `JWT_ACCESS_TTL`, `JWT_REFRESH_TTL`.

#### AviaScan — compartilhado conscientemente

`AVIASCAN_API_BASE_URL` e `AVIASCAN_HTTP_TIMEOUT_MS` existem **apenas como
secrets repo-level** — não há override em nenhum Environment, logo prod e staging
recebem **o mesmo destino AviaScan** via fallback. Decisão atual: **compartilhar**
(não há sandbox/endpoint AviaScan distinto para staging). Se um endpoint próprio
de staging passar a existir, adicionar override explícito:

```bash
gh secret set AVIASCAN_API_BASE_URL --env staging --repo atzaero/aerobi-api --body "<URL_SANDBOX_STAGING>"
```

#### `SEED_USER_*` — bootstrap por ambiente (depende de #227)

`staging` tem `SEED_USER_1_*` e `SEED_USER_2_*` (8 secrets) para o bootstrap
idempotente via `RUN_SEEDS_ON_BOOT`; `production` tem **zero** (bootstrapado por
outro caminho — convite manual / seed temporário já removido). A padronização da
estratégia de bootstrap está em aberto na issue **#227** e deve ser resolvida lá;
até então, manter os `SEED_USER_*` só em staging é intencional.

### Cobertura do guard anti-fallback

O guard (`deploy.yml`, ativado por `db_name_guard`, só roda em staging) faz
**validação positiva** das chaves que carregam marcador textual de ambiente:

- `DATABASE_URL` → tem de apontar para o banco `aerobi_staging`;
- `CORS_ORIGINS` → tem de conter `staging`;
- `FRONTEND_URL` → tem de conter `staging`.

Falhas são **acumuladas** e o job aborta listando todas de uma vez. Secrets
**opacos** marcados como `divergir` (AEROBI_API_KEY, JWT_*, MINIO_*, MAIL_*,
FIREBASE_*) **não** têm marcador textual → não são validáveis automaticamente;
sua divergência é responsabilidade da auditoria desta matriz.

## Comandos `gh` (setup / auditoria dos Environments)

Listar o que cada escopo tem hoje (apenas nomes):

```bash
REPO=atzaero/aerobi-api
gh secret list --repo $REPO                 # repo-level (fallback)
gh secret list --env production --repo $REPO
gh secret list --env staging --repo $REPO
```

Setar/atualizar um secret que deve divergir em staging:

```bash
REPO=atzaero/aerobi-api

# DATABASE_URL de staging — senha em ansible-vault (vault_aerobi_staging_db_password)
gh secret set DATABASE_URL --env staging --repo $REPO \
  --body "postgresql://aerobi_staging_user:<SENHA_VAULT>@postgres:5432/aerobi_staging?schema=public"

# AEROBI_API_KEY própria de staging (chave distinta da de produção)
gh secret set AEROBI_API_KEY --env staging --repo $REPO --body "<CHAVE_STAGING>"
```

> A trava anti-fallback do `deploy.yml` bloqueia o deploy de staging enquanto
> `DATABASE_URL`/`CORS_ORIGINS`/`FRONTEND_URL` de staging não estiverem corretos
> (não sobe contra o banco/origem de produção).

## Fluxo de release

```
merge/push em develop
  → semantic-release → vX.Y.Z-beta.N (CHANGELOG/tag/release prerelease)
  → build & push GHCR (tags: vX.Y.Z-beta.N + beta)
  → deploy-staging (Environment staging, -p staging, .env.staging, porta 3433)

merge/push em main
  → semantic-release → vX.Y.Z (estável)
  → build & push GHCR (tags: vX.Y.Z + latest)
  → deploy-production (porta 3333) — inalterado
```
