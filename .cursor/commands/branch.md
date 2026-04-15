# Criar Branch

Cria uma branch seguindo a convenção do projeto, vinculada a uma issue do GitHub
e adicionada ao projeto no GitHub Projects.

## Responsável e projeto (obrigatório)

- **Assignee padrão em issues:** `elvisea` — usar `--assignee elvisea` ao criar issues (`gh issue create`).
- **Projeto da organização:** toda issue (e o PR correspondente) deve ser vinculada ao [GitHub Project #2 (atzaero)](https://github.com/orgs/atzaero/projects/2) via `gh project item-add` (veja comandos abaixo).

## Repositório

Este fluxo aplica-se ao backend **aerobi-api** (`atzaero/aerobi-api`). Executar comandos `git` e `gh` a partir da raiz do repositório clonado.

## Convenção de Nomenclatura

Formato: `tipo/numero-da-issue`

Exemplos:

- `feat/230` — nova funcionalidade referente à issue #230
- `fix/145` — correção de bug referente à issue #145
- `chore/89` — tarefa de manutenção referente à issue #89
- `refactor/312` — refatoração referente à issue #312
- `docs/67` — documentação referente à issue #67

**Nunca** usar nomes descritivos longos sem número de issue:

- ❌ `feature/adiciona-endpoint-sync`
- ✅ `feat/230`

## Workflow

1. **Issue** — se ainda não existir, criar com assignee `elvisea` e adicionar ao projeto #2 (comandos na seção abaixo).
2. **Solicitar informações** — confirmar o número da issue e o tipo (feat, fix, chore, refactor, docs, test, perf).
3. **Buscar detalhes da issue** — ler título e descrição no GitHub para validar o tipo.
4. **Confirmar nome** — apresentar `tipo/numero` antes de criar a branch.
5. **Criar branch localmente** — `git checkout -b tipo/numero` a partir da branch base correta.
6. **Vincular branch à issue** — `gh issue develop <numero> -n tipo/numero --base develop --repo atzaero/aerobi-api` (ou criar a branch localmente, fazer push e usar a UI/GitHub para vincular).
7. **Projeto** — garantir a issue no [projeto #2](https://github.com/orgs/atzaero/projects/2): `gh project item-add 2 --owner atzaero --url https://github.com/atzaero/aerobi-api/issues/<numero>`.
8. **Confirmar** — branch pronta para uso.

## Branch Base

- Para `feat`, `refactor`, `docs`, `test`, `perf` → partir de `develop`
- Para `fix` urgente (hotfix) → partir de `main`
- Para `chore` → partir de `develop`

## Comandos

```bash
# 0. (Opcional) Criar issue — assignee elvisea + projeto #2
ISSUE_URL=$(gh issue create --repo atzaero/aerobi-api \
  --title "tipo(escopo): descrição curta" \
  --body "Corpo da issue." \
  --assignee elvisea)
gh project item-add 2 --owner atzaero --url "$ISSUE_URL"

# 1. Atualizar branch base
git checkout develop && git pull origin develop

# 2. Criar e entrar na nova branch (ex.: issue #230)
git checkout -b feat/230

# 3. Vincular branch à issue no GitHub
gh issue develop 230 -n feat/230 --base develop --repo atzaero/aerobi-api

# 4. Se a issue ainda não estiver no projeto, adicionar
gh project item-add 2 --owner atzaero --url https://github.com/atzaero/aerobi-api/issues/230
```

## Projeto GitHub

- **Organização:** atzaero
- **Repositório:** aerobi-api
- **Projeto (URL canônica):** https://github.com/orgs/atzaero/projects/2
- **Assignee padrão:** elvisea
- Toda issue deve estar no projeto ao iniciar o trabalho
