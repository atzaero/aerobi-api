# Babysit PR (acompanhar Actions e revisão)

Mantém um **Pull Request** sob vigilância após criação ou push: **GitHub Actions**,
estado de **merge**, e (quando relevante) **comentários de review**, até o PR estar
pronto para merge ou até ser necessário pedir ajuda humana.

Padrão de workflow (polling contínuo, prioridade review vs rerun cego, classificação
de falhas) inspirado na skill **babysit-pr** (OpenAI Codex) e no hábito de "babysit"
de PR ([vídeo](https://www.youtube.com/watch?v=qToBgU8K4Ms&t=18s)).

## Quando usar

- Imediatamente após **`/pr`** (ou push que atualiza o head do PR).
- Quando o usuário pede para **monitorar CI**, **ver Actions** ou **corrigir falhas do PR**.

## Contexto CI neste repo (`atzaero/aerobi-api` — backend NestJS)

Workflow **CI** (ver [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)) —
dispara em push para `develop` e em PRs para `main`/`develop`; `concurrency` cancela
execução anterior na mesma ref. Três jobs **encadeados** (`needs`):

1. **Security** — `npm run security:check` (audit de deps de produção, severidade high+).
2. **Quality** (`needs: security`) — `npm ci` → `npx prisma generate` →
   `npx prisma validate` → `npm run lint:check` (ESLint sem fix) → `npm run format:check`
   (Prettier) → `npm run build`.
3. **Test** (`needs: quality`) — sobe serviço **Postgres 18**, `npm ci`,
   `npx prisma generate`, `npx prisma migrate deploy` e `npm run test` (Jest)
   com `DATABASE_URL` apontando para o Postgres do runner.

Como os jobs são encadeados, falha em **Security** impede Quality/Test; falha em
**Quality** impede Test. Ataque a causa do job mais a montante primeiro.

## Inputs

- **PR implícito:** branch atual (`gh pr view --json number,url` ou `gh pr list --head <branch>`).
- **PR explícito:** número ou URL (`atzaero/aerobi-api#42`).

Repo por padrão: **`atzaero/aerobi-api`** (ajustar com `--repo` se necessário).

## Fluxo (agente)

1. **Resolver o PR** — `gh pr list --head "$(git branch --show-current)" --repo atzaero/aerobi-api --json number,url,state`.
2. **Estado inicial** — `gh pr view <N> --repo atzaero/aerobi-api --json url,state,mergeable,mergeStateStatus,statusCheckRollup`.
3. **Checks** — `gh pr checks <N> --repo atzaero/aerobi-api --watch` para aguardar conclusão.
4. **Se falhar um job** — obter logs:
   - `gh run list --repo atzaero/aerobi-api --branch "$(git branch --show-current)" --limit 5`
   - `gh run view <run-id> --repo atzaero/aerobi-api --log-failed`
5. **Classificar a falha**
   - **Relacionada ao branch:** lint, format, build, test, erros de tipo ou de
     schema/migration Prisma em arquivos tocados → corrigir localmente, commit
     convencional (`fix(ci): ...`), push, **voltar ao passo 2**.
   - **Infra / flake / audit transitivo global:** não "consertar à-toa"; até **uma**
     repetição (`gh run rerun <run-id> --failed`) se for claramente flake **e** o
     usuário concordar; caso contrário reportar.
6. **Review** — havendo feedback de review acionável e correto, endereçar **antes** de
   reruns cegos; o novo commit re-dispara checks.
7. **Não parar cedo** — com checks `pending`, continuar a vigilância (`--watch` ou
   polls) até conclusão ou stop estrito.
8. **Stop** — PR merged/closed, bloqueio que exige humano (permissões, decisão de
   produto), ou interrupção explícita.

## Comandos úteis (copiar)

```bash
# PR a partir da branch atual
gh pr list --head "$(git branch --show-current)" --repo atzaero/aerobi-api --json number,url,state

# Estado / mergeability
gh pr view <N> --repo atzaero/aerobi-api --json url,state,mergeable,mergeStateStatus,statusCheckRollup

# Checks + esperar
gh pr checks <N> --repo atzaero/aerobi-api --watch

# Últimas execuções na branch / logs do job falhado
gh run list --repo atzaero/aerobi-api --branch "$(git branch --show-current)" --limit 8
gh run view <RUN_ID> --repo atzaero/aerobi-api --log-failed

# Rerun (só quando classificado como flake / infra)
gh run rerun <RUN_ID> --repo atzaero/aerobi-api --failed
```

## Validar localmente antes de empurrar (espelha o CI)

```bash
npm run security:check   # job Security
npm run lint:check       # job Quality
npm run format:check     # job Quality
npm run build            # job Quality
npm run test             # job Test (precisa de Postgres + prisma migrate deploy)
```

## Mensagens de commit sugeridas (fixes de CI do branch)

- `fix(ci): <motivo curto>` · `fix(lint): <…>` · `test: <…>`

## Notas

- O assignee (`elvisea`) e o **[GitHub Project #2 (atzaero)](https://github.com/orgs/atzaero/projects/2)**
  seguem o fluxo em [`pr.md`](./pr.md) / [`merge.md`](./merge.md).
- **Não** publicar respostas automáticas a comentários de review humanos sem confirmação do usuário.
