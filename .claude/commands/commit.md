# Commit Inteligente

Cria commits seguindo boas práticas de Git, agrupando arquivos relacionados
por funcionalidade e usando Conventional Commits.

## Contexto atzaero

- Trabalhar em branch `tipo/numero-da-issue` vinculada a issue com **assignee** `elvisea` e issue no [projeto #2](https://github.com/orgs/atzaero/projects/2) (fluxo `/branch`).
- Repositório: **atzaero/aerobi-api** (NestJS).

## Boas Práticas

✅ **Commits por grupo de arquivos relacionados** (recomendado)

- Um commit = uma mudança completa e funcional
- Facilita revisão, rollback e entendimento do histórico

❌ **Evitar commits por arquivo individual**

- Fragmenta o histórico e dificulta entender o contexto completo

## Convenção (Conventional Commits)

Formato: `tipo(escopo opcional): descrição`

| Tipo       | Uso                                     |
| ---------- | --------------------------------------- |
| `feat`     | Nova funcionalidade                     |
| `fix`      | Correção de bug                         |
| `chore`    | Manutenção, dependências, configuração  |
| `docs`     | Documentação                            |
| `style`    | Formatação sem mudança de lógica        |
| `refactor` | Refatoração sem nova feature ou bug fix |
| `test`     | Adição ou correção de testes            |
| `perf`     | Melhorias de performance                |

**Escopo** é opcional e indica o módulo/área afetada:
`feat(sync): adiciona job de sincronização RAB`

**Corpo** — use quando a mudança não é óbvia pelo título:

```
fix(prisma): corrige migração de índice duplicado

A migração anterior falhava em deploy com schema já existente.
```

## Contexto do Projeto

Backend **NestJS** ([aerobi-api](https://github.com/atzaero/aerobi-api)):

- `src/` — aplicação Nest (módulos, controllers, services, guards, etc.)
- `src/modules/<dominio>/` — funcionalidades por domínio (quando aplicável)
- `prisma/` — schema e migrações
- Testes unitários em `src/**/*.spec.ts` (Jest)
- `.github/workflows/` — CI
- `docker-compose.dev.yml` — desenvolvimento com serviço `api` e Postgres

Escopos comuns:

- `auth`, `sync`, `prisma`, `ci`, `docker`, `config`, nome do módulo em `src/modules/<x>/`

## Docker (desenvolvimento)

Alguns fluxos devem espelhar o ambiente do container (dependências nativas, Postgres, `DATABASE_URL`).

**Shell no container:**

```bash
docker compose -f docker-compose.dev.yml run --rm api bash
```

**Comandos pontuais (sem abrir shell):**

```bash
docker compose -f docker-compose.dev.yml run --rm api npm run lint
docker compose -f docker-compose.dev.yml run --rm api npm run format:check
docker compose -f docker-compose.dev.yml run --rm api npm run build
docker compose -f docker-compose.dev.yml run --rm api npm run test
```

O Compose sobe dependências necessárias (ex.: Postgres saudável antes do `api`). Preferir **rodar no container** quando a alteração afeta Prisma, integrações ou quando o host divergir do CI.

## Verificação antes de commitar

Sugerido (host ou, quando indicado acima, via `docker compose ... run --rm api ...`):

- `npm run format:check`
- `npm run build`
- `npm run lint` (atenção: o script usa `--fix`; para só verificar, usar `npx eslint` com flags de check se necessário)
- `npm run test`

## Workflow

1. **Analisar mudanças** — executar `git status` e `git diff` para entender o que mudou
2. **Agrupar por contexto** — arquivos do mesmo módulo/feature formam um grupo
3. **Propor grupos e mensagens** — apresentar os grupos ao usuário com mensagens sugeridas
4. **Aguardar confirmação** — só commitar após aprovação explícita
5. **Executar commits** — `git add [arquivos]` + `git commit -m "..."`

## Regras de Agrupamento

- Arquivos no mesmo módulo/diretório → mesmo commit
- Testes relacionados → mesmo commit que o código testado
- Arquivos de configuração → commit separado (`chore`)
- Migrações Prisma → commit separado (`chore(prisma)` ou `fix(prisma)` conforme o caso)
- Mudanças de dependências → commit separado (`chore`)
- Arquivos `.claude/` ou `.cursor/commands/` → commit separado (`chore(tooling)`)

## Exemplos do Projeto

### Nova feature

```
src/modules/foo/foo.module.ts
src/modules/foo/foo.controller.ts
src/modules/foo/foo.service.ts
```

→ `feat(foo): adiciona endpoint de consulta`

### Correção de bug

```
src/modules/bar/bar.service.ts
src/modules/bar/bar.service.spec.ts
```

→ `fix(bar): corrige timezone no agendamento`

### Configuração

```
.claude/commands/commit.md
.cursor/commands/commit.md
.github/workflows/ci.yml
```

→ `chore(tooling): adiciona comandos Claude/Cursor e ajusta CI`

## Checklist antes de commitar

- [ ] Mensagem segue o formato `tipo(escopo): descrição`
- [ ] Tipo é um dos válidos
- [ ] Descrição é clara e concisa (máximo 72 caracteres)
- [ ] Arquivos agrupados fazem sentido juntos
- [ ] Nenhuma mudança não relacionada no mesmo commit
- [ ] Arquivos sensíveis (.env, credenciais) foram excluídos
