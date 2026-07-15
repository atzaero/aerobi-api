# Fluxo completo Git (branch → commit → review → PR → babysit)

Orquestra **em sequência** os fluxos já documentados nos comandos atômicos.
Para cada etapa aplicável ao estado atual (`git status`, branch, diff),
**abra o arquivo canon correspondente e siga o workflow completo ali**
antes de avançar.

Contexto da stack e operação: [`README.md`](../../README.md)

---

## Como o assistente deve agir

1. Inspecionar o estado: branch atual (`git branch --show-current`), working
   tree staged/unstaged, remoto.
2. Executar apenas os passos **relevantes** — se o usuário já está em branch
   correta e só quer fechar PR, pode enfatizar 2 → 3 → 4 → 5.
3. Em cada passo, **não resumir de memória** o que está nos arquivos canon:
   use-os como checklist e citar seções quando reportar ao usuário.

---

## 1) Branch

**Canon:** [`branch.md`](./branch.md)

- Sem issue aberta para o trabalho: **criar issue no GitHub** com assignee
  `elvisea`, vincular ao [projeto #2 (atzaero)](https://github.com/orgs/atzaero/projects/2),
  depois ramificar no formato **`tipo/numero-da-issue`** — ver `branch.md`.
- **Incluir** quando: criar ramo novo, validar convenção de nome ou alinhar
  base (`develop` / `main`) conforme tipo.
- **Pular** quando: branch já está no padrão e o usuário confirmou que não
  haverá mudança de ramo nesta sessão.

---

## 2) Commit

**Canon:** [`commit.md`](./commit.md)

- Agrupar mudanças, mensagens Conventional Commits, confirmação explícita antes
  de gravar commits.
- Só gravar commits após o usuário **aprovar** as mensagens propostas.
- Para mudanças que afetam Prisma (schema/migrations) ou comportamento ligado a
  Postgres/HTTP externos, considerar rodar testes **dentro do container**:

  ```bash
  docker compose -f docker-compose.dev.yml run --rm api npm run test
  ```

---

## 3) Review

**Canon:**

- [`review.md`](./review.md) — checklist
- [`../agents/code-reviewer.md`](../agents/code-reviewer.md) — agente
  automatizado (saída: severidades 🔴/🟡/🔵 + `arquivo:linha`). Invocar via
  `Agent` com `subagent_type: "code-reviewer"` antes do `/pr`.

- Rodar contra o diff atual (working tree ou commits ainda não pushed,
  conforme combinar com o usuário).
- Validar localmente o que o CI costuma exercitar (`npm run format:check`,
  `npm run build`, `npm test`, `npm run security:check`). Se algo falhar,
  resolver antes do PR.
- **Críticos** (segurança, bug, quebra de contrato) devem ser tratados antes
  de abrir ou atualizar PR — ou documentar exceção aceita pelo usuário.
- Convenções fortes deste repo:
  - `CustomHttpException` + `ErrorCode`, mensagens via `ErrorMessageService`.
  - Dados sensíveis / segredos: `EncryptionService` e env onde aplicável; sem
    literais de API keys ou URLs secretas no código.
  - Rotas protegidas com `AerobiApiKeyGuard` quando o módulo segue esse padrão.

---

## 4) Pull Request

**Canon:** [`pr.md`](./pr.md)

- Confirmar repositório (`gh repo view` deve indicar **atzaero/aerobi-api**).
- Base **develop** para feature/fix/chore/refactor típicos; hotfix urgente pode
  usar `main` conforme `pr.md` / `branch.md`.
- Descrição com `Closes #N` quando aplicável (issue da branch).
- Assignee `elvisea` (`gh pr create --assignee elvisea`).
- Após criar o PR, adicionar ao [projeto #2](https://github.com/orgs/atzaero/projects/2)
  com `gh project item-add` (ver `pr.md`).

---

## 5) Babysit do PR (acompanhar CI)

**Canon:** [`babysit-pr.md`](./babysit-pr.md) — e a skill
[`../skills/babysit-pr/SKILL.md`](../skills/babysit-pr/SKILL.md).

- Após abrir/atualizar o PR, acompanhar o **GitHub Actions** até verde:
  monitorar (`gh pr checks <N> --repo atzaero/aerobi-api --watch`), ler logs de
  jobs falhados (`gh run view <RUN_ID> --log-failed`), classificar a falha
  (branch vs. infra/flake) e corrigir o que for do branch, empurrando de novo
  em loop — priorizando feedback de review sobre rerun cego de workflow.
- CI tem três jobs encadeados: **Security** → **Quality** (Prisma validate,
  `lint:check`, `format:check`, build) → **Test** (Postgres 18 + `prisma migrate
  deploy` + Jest). Ataque o job mais a montante primeiro.
- Parar quando: CI verde, ou bloqueio que exige decisão humana.

---

## Ordem "típica" (guia)

| Momento do trabalho       | Passos costumam ser…         |
| ------------------------- | ---------------------------- |
| Início de feature         | 1 → (código) → 2 → 3 → 4 → 5 |
| Só fechar após codar      | 2 → 3 → 4 → 5                |
| Ramo já certo, só revisar | 3 → (ajustes) → 2 → 4 → 5    |

Ajuste conforme o pedido na mensagem que invocou este fluxo.
