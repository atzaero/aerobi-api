# Branch protection (GitHub) — estado e configuração

O workflow **CI** (`.github/workflows/ci.yml`) corre em PRs para `develop` / `main`,
mas **só bloqueia merge automaticamente** com as regras abaixo aplicadas. Elas são
também o pré-requisito do **auto-merge do Dependabot**
(`.github/workflows/dependabot-auto-merge.yml`): sem required checks, o auto-merge
nativo mescla imediatamente, sem esperar o CI.

## `develop` (aplicado)

- **Require status checks to pass before merging** com os três jobs do CI:
  **Security**, **Quality**, **Test** (nomes = `name:` dos jobs em `ci.yml`).
- **Sem** exigência de aprovação de review (o fluxo do time mescla PRs próprios
  após CI verde; review humano continua acontecendo via `/review`/code-reviewer).
- **Sem** "require branches to be up to date" (`strict: false`) — o CI roda no
  merge-ref do PR, e strict travaria a fila do auto-merge a cada merge no develop.
- `enforce_admins: false` — admins conseguem destravar emergência via `--admin`.

Aplicação por API (idempotente; requer admin):

```bash
gh api -X PUT repos/atzaero/aerobi-api/branches/develop/protection \
  --input - <<'JSON'
{
  "required_status_checks": {
    "strict": false,
    "checks": [
      { "context": "Security" },
      { "context": "Quality" },
      { "context": "Test" }
    ]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": null,
  "restrictions": null
}
JSON
```

Também é preciso habilitar o auto-merge no repositório (uma vez):

```bash
gh api -X PATCH repos/atzaero/aerobi-api -f allow_auto_merge=true
```

## Auto-merge do Dependabot — guarda-corpos

- Só **patch/minor** (`dependabot/fetch-metadata`); **majors** recebem comentário
  e ficam para revisão humana (ex.: eslint 9→10 exigiu fix de código, PR #598).
- Merge só após os required checks acima ficarem verdes (2018+ testes, lint,
  build, audit) — se o bump quebrar qualquer um (ex.: prettier 3.9 mudou
  formatação), o CI fica vermelho e o PR simplesmente espera humano.
- `cooldown` de 7 dias no `dependabot.yml`: bump só é proposto uma semana após a
  publicação — janela para o ecossistema apanhar versão maliciosa (supply-chain)
  ou quebrada antes de ela chegar aqui.
- Alvo é o `develop` (canal beta); produção só recebe na promoção `develop → main`.
- O merge é feito pelo `GITHUB_TOKEN` e **não dispara** workflows de push no
  develop — aceitável: o CI já validou o merge-ref e `chore(deps)` não gera
  release no semantic-release.

## `main` (recomendado, não aplicado)

Mesmos required checks de `develop`, se quiser travar também a promoção de
release. Configurar igual, trocando `develop` por `main` no comando acima.

## Notas

- Se a lista de checks aparecer vazia na UI, abrir um PR de teste para o GitHub
  registar os contexts.
- Isto não substitui **code review** nem **dependabot/audit** — complementa.
