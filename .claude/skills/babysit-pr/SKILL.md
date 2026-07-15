---
name: babysit-pr
description: >-
  Após criar ou atualizar um PR no atzaero/aerobi-api, acompanhar GitHub Actions
  (gh pr checks --watch), ler logs de jobs falhados, classificar falha
  (branch vs infra/flake), corrigir e fazer push em loop até CI verde ou
  bloqueio humano. Priorizar feedback de review sobre rerun cego de workflow.
---

# Babysit PR — skill (aerobi-api)

## Acionar

Quando o usuário disser: monitorar PR, acompanhar Actions, babysit CI, ou após `/pr`.

## Procedimento

Seguir o comando de projeto: [`.claude/commands/babysit-pr.md`](../../commands/babysit-pr.md).

## Lembretes rápidos

- Repo: **`atzaero/aerobi-api`**; workflow **CI** com três jobs encadeados —
  **Security** (`security:check`) → **Quality** (prisma generate/validate,
  `lint:check`, `format:check`, build) → **Test** (Postgres 18 + `prisma migrate
  deploy` + Jest). Ataque a causa do job mais a montante primeiro.
- Falhas de **audit** transitivo podem ser **pré-existentes**; não expandir escopo
  sem confirmação.
- Polling contínuo: não parar só porque um snapshot parece idle com checks ainda a correr.
- Assignee `elvisea` e [GitHub Project #2 (atzaero)](https://github.com/orgs/atzaero/projects/2)
  seguem o fluxo em `pr.md`.
- **Não** responder automaticamente a comentários de review humanos sem confirmação.
