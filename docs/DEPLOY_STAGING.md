# Deploy — Staging (semantic-release prerelease)

Caminho de **staging** automático, espelhando produção, sem quebrar o fluxo de
produção existente.

## Visão geral

| Branch | semantic-release | Tag | Deploy | Ambiente |
|---|---|---|---|---|
| `develop` | prerelease `beta` | `vX.Y.Z-beta.N` | automático | **staging** |
| `main` | estável | `vX.Y.Z` | automático | **produção** (inalterado) |

- Config: [`.releaserc.json`](../.releaserc.json) → `"branches": ["main", { "name": "develop", "prerelease": "beta" }]`.
- Workflow: [`.github/workflows/release.yml`](../.github/workflows/release.yml) — um job `release` decide `is_prerelease` (a versão conter `-beta.N`) e roteia para `deploy-staging` ou `deploy-production`.
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

Dois Environments: **`production`** e **`staging`**. Conexão SSH é a MESMA VPS →
fica repo-level; o que difere por ambiente fica no Environment.

### Repo-level secrets (compartilhados — já existem)

`GH_TOKEN`, `SSH_PRIVATE_KEY`, `REMOTE_HOST`, `REMOTE_PORT`, `REMOTE_USER`.

> Produção também mantém `DATABASE_URL`, `CORS_ORIGINS`, `AEROBI_API_KEY`, etc.
> em repo-level (comportamento atual preservado). O Environment `production` está
> vazio de secrets — repo-level continua valendo (Environment vazio não sobrepõe).

### Environment `staging` — variables (não sensível)

| Variable | Valor | Origem |
|---|---|---|
| `REMOTE_TARGET` | `/home/deploy/apps/aerobi-api-staging` | Ansible `setup_staging.yml` |
| `HOST_PORT` | `3433` | Ansible `ports.yml` (`app_ports.staging`) |

### Environment `staging` — secrets (obrigatórios)

Mesmos **nomes** dos de produção, **valores** de staging:

| Secret | Observação |
|---|---|
| `DATABASE_URL` | **Obrigatório.** `postgresql://aerobi_staging_user:<senha-vault>@postgres:5432/aerobi_staging?schema=public` |
| `CORS_ORIGINS` | `https://staging.aerobi.com.br` |
| `FRONTEND_URL` | `https://staging.aerobi.com.br` |
| `AEROBI_API_KEY` | chave própria de staging |

Opcionais (mesmos nomes da prod, se aplicável): `AEROBI_REQUIRE_AUTH`,
`PLUGFIELD_API_KEY`, `PLUGFIELD_TOKEN`, `PLUGFIELD_API_BASE_URL`,
`PLUGFIELD_HTTP_TIMEOUT_MS`, `AISWEB_API_KEY`, `AISWEB_API_PASS`,
`AISWEB_HTTP_TIMEOUT_MS`, `AVIASCAN_API_BASE_URL`, `AVIASCAN_HTTP_TIMEOUT_MS`,
`AVIASCAN_CACHE_TTL_MS`, `ANAC_RAB_INDEX_URL`, `HTTP_USER_AGENT`,
`RAB_SYNC_CRON`, `RAB_SYNC_CRON_DISABLED`, `JWT_SECRET_PUBLIC_KEY`,
`JWT_SECRET_PRIVATE_KEY`, `JWT_ACCESS_TTL`, `JWT_REFRESH_TTL`.

> ⚠️ **Trava de segurança.** Como staging e produção compartilham nomes de
> secrets, um secret **não configurado** no Environment `staging` faz *fallback*
> para o valor repo-level (de produção). Por isso `DATABASE_URL` é obrigatório, e
> o job `deploy-staging` **aborta** se o `DATABASE_URL` não apontar para
> `aerobi_staging`. Configure os secrets de staging **antes** do primeiro deploy.

## Comandos `gh` (setup dos Environments)

```bash
REPO=atzaero/aerobi-api

# Criar Environments (idempotente)
gh api -X PUT repos/$REPO/environments/production --silent
gh api -X PUT repos/$REPO/environments/staging --silent

# Variables do Environment staging (não sensível)
gh variable set REMOTE_TARGET --env staging --repo $REPO \
  --body "/home/deploy/apps/aerobi-api-staging"
gh variable set HOST_PORT --env staging --repo $REPO --body "3433"

# Secrets do Environment staging (valores reais — NÃO commitar)
gh secret set DATABASE_URL --env staging --repo $REPO \
  --body "postgresql://aerobi_staging_user:<SENHA_VAULT>@postgres:5432/aerobi_staging?schema=public"
gh secret set CORS_ORIGINS  --env staging --repo $REPO --body "https://staging.aerobi.com.br"
gh secret set FRONTEND_URL  --env staging --repo $REPO --body "https://staging.aerobi.com.br"
gh secret set AEROBI_API_KEY --env staging --repo $REPO --body "<CHAVE_STAGING>"
# ... demais opcionais conforme necessário
```

A senha de staging vive no `ansible-vault` do projeto `aerobi-ansible`
(`vault_aerobi_staging_db_password`).

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
