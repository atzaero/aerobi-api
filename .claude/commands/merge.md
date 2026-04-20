# Merge e Pós-Merge

Executa o merge de uma Pull Request e a rotina de limpeza pós-merge:
volta para `develop`, atualiza com o remoto e remove a branch local mesclada.

## Contexto atzaero

- **Repositório:** backend **aerobi-api** — `atzaero/aerobi-api` (NestJS + Prisma/Postgres).
- Base branch padrão: `develop`
- Branches de trabalho: `tipo/numero-da-issue` (fluxo `/branch`)
- PRs sempre vinculadas a issue no [projeto #2](https://github.com/orgs/atzaero/projects/2)

## Pré-condições

- [ ] Estar em uma branch com PR aberta apontando para `develop`
- [ ] PR no estado `MERGEABLE` (checks verdes, sem conflitos)
- [ ] Nenhuma mudança não commitada no working tree

## Workflow

1. **Identificar a PR**
   - Detectar a branch atual: `git branch --show-current`
   - Buscar a PR associada:
     ```bash
     gh pr list --repo atzaero/aerobi-api --head <branch> \
       --json number,baseRefName,title,url,mergeable,state
     ```
   - Abortar se não houver PR aberta ou se `mergeable != "MERGEABLE"`

2. **Confirmar com o usuário**
   - Exibir número, título, base e URL da PR
   - Aguardar aprovação explícita antes de mesclar

3. **Executar o merge + remoção remota**

   ```bash
   gh pr merge <num> --repo atzaero/aerobi-api --merge --delete-branch
   ```

   - Usar `--merge` (merge commit). Só usar `--squash` ou `--rebase` se o usuário pedir.
   - `--delete-branch` remove a branch no remoto automaticamente.

4. **Rotina pós-merge (local)**

   ```bash
   git checkout develop
   git pull origin develop
   git branch -d <branch>
   ```

   - `git branch -d` (minúsculo) é seguro: só remove se estiver mesclada.
   - Se falhar com "not fully merged", investigar — **não** usar `-D` sem confirmação.

5. **Encerrar a issue relacionada**
   - O número da issue é o sufixo da branch (`tipo/187` → issue `#187`).
   - Fechar com comentário de rastreabilidade para a PR:
     ```bash
     gh issue close <num> --repo atzaero/aerobi-api \
       --comment "Concluída via PR #<pr> (merge em develop)."
     ```
   - Se a PR já incluía `Closes #<num>` na descrição ou no título do merge, o GitHub pode fechar sozinho — ainda assim, verificar o estado da issue e não duplicar comentários desnecessários.

6. **Relatar resultado**
   - Confirmar branch atual (`develop`), HEAD atualizado, branch local removida e issue fechada (ou já estava fechada).

## Opcional — após atualizar `develop` (backend)

Se o merge alterou **`prisma/schema.prisma`** ou **`prisma/migrations/`**:

- `npm install` (se `package.json` / lock mudou)
- `npm run prisma:generate`
- Ambiente local com Postgres (ex. [`docker-compose.dev.yml`](../../docker-compose.dev.yml)): aplicar migrações com o fluxo do time (`npm run prisma:migrate` em dev ou `npm run prisma:deploy` onde couber).

Isso não substitui CI; serve para o desenvolvedor validar o working copy após o pull.

## Regras de Segurança

- ❌ **NUNCA** mesclar PR sem confirmação explícita do usuário
- ❌ **NUNCA** forçar remoção (`git branch -D`) sem investigar o motivo do `-d` falhar
- ❌ **NUNCA** fazer push forçado em `develop`/`main` nem reescrever histórico compartilhado
- ✅ Sempre verificar `mergeable` antes de tentar mesclar
- ✅ Sempre deletar a branch remota (`--delete-branch`) para manter o repositório limpo

## Exemplo de saída esperada

```
PR #37 — feat(prisma): domínio operacional ex-Firestore (#36)
Base: develop · Status: MERGEABLE
URL:  https://github.com/atzaero/aerobi-api/pull/37

✓ PR mesclada
✓ Branch remota feat/36 removida
✓ Checkout develop
✓ develop atualizado (fdc353a..e162ec8)
✓ Branch local feat/36 removida
✓ Issue #36 fechada
```

## Quando NÃO usar

- PR em draft ou com checks pendentes — aguarde CI antes
- PR com conflitos — resolver antes de chamar este comando
- Branches sem PR — use `gh pr create` (ou `/pr`) primeiro
