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

> Os secrets de **aplicação** repo-level (`DATABASE_URL`, `AEROBI_API_KEY`, …)
> tornaram-se redundantes após a migração para o Environment `production` e
> podem ser removidos depois de validado o primeiro release pós-merge.

### Variables por Environment (não sensível)

| Variable | `production` | `staging` | Origem |
|---|---|---|---|
| `REMOTE_TARGET` | `/home/deploy/apps/aerobi-api` | `/home/deploy/apps/aerobi-api-staging` | Ansible |
| `HOST_PORT` | `3333` | `3433` | Ansible `ports.yml` |

### Secrets por Environment

Mesmos **nomes** nos dois ambientes, **valores** diferentes. `production` foi
populado a partir do `.env` do servidor; `staging` com URLs próprias + chaves de
upstream externo (Plugfield/AISWEB) copiadas de prod.

| Secret | `production` | `staging` |
|---|---|---|
| `DATABASE_URL` | banco `aerobi` | banco `aerobi_staging` (**pendente** — senha no vault) |
| `AEROBI_API_KEY` | chave prod | **pendente** — chave distinta de staging |
| `CORS_ORIGINS` | origem prod | `https://staging.aerobi.com.br` |
| `FRONTEND_URL` | (n/d em prod) | `https://staging.aerobi.com.br` |
| `PLUGFIELD_*`, `AISWEB_*`, `ANAC_RAB_INDEX_URL`, `HTTP_USER_AGENT` | de prod | copiados de prod |

Opcionais (se aplicável, mesmos nomes): `AEROBI_REQUIRE_AUTH`,
`PLUGFIELD_API_BASE_URL`, `PLUGFIELD_HTTP_TIMEOUT_MS`, `AISWEB_HTTP_TIMEOUT_MS`,
`AVIASCAN_*`, `RAB_SYNC_CRON`, `RAB_SYNC_CRON_DISABLED`, `JWT_SECRET_PUBLIC_KEY`,
`JWT_SECRET_PRIVATE_KEY`, `JWT_ACCESS_TTL`, `JWT_REFRESH_TTL`.

> ⚠️ **Trava anti-fallback.** Como os nomes de secret são compartilhados, um
> secret **não configurado** no Environment faz *fallback* para o valor
> repo-level. O job de deploy de staging (`deploy.yml`, input `db_name_guard`)
> **aborta** se: (a) `DATABASE_URL` não apontar para `/aerobi_staging`, ou
> (b) `CORS_ORIGINS` não contiver `staging`. Configure os secrets pendentes de
> staging **antes** do primeiro deploy, senão o guard bloqueia (por desenho).

## Comandos `gh` (setup dos Environments)

Já provisionado (Environments criados, `production` migrado do servidor,
variables setadas, staging com URLs + chaves de upstream). **Falta apenas**
setar os dois secrets pendentes de staging:

```bash
REPO=atzaero/aerobi-api

# DATABASE_URL de staging — senha em ansible-vault (vault_aerobi_staging_db_password)
gh secret set DATABASE_URL --env staging --repo $REPO \
  --body "postgresql://aerobi_staging_user:<SENHA_VAULT>@postgres:5432/aerobi_staging?schema=public"

# AEROBI_API_KEY própria de staging (chave distinta da de produção)
gh secret set AEROBI_API_KEY --env staging --repo $REPO --body "<CHAVE_STAGING>"
```

> Enquanto `DATABASE_URL` de staging não for setado, a trava anti-fallback do
> `deploy.yml` bloqueia o deploy de staging (não sobe contra o banco de prod).

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
