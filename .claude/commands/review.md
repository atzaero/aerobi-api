# Review de Código

Revisa o código atual antes de commitar ou abrir PR, verificando qualidade,
padrões arquiteturais e boas práticas do projeto.

## Rastreabilidade (atzaero)

- Branch no formato `tipo/numero-da-issue`; issue com **assignee** `elvisea` e entrada no [GitHub Project #2](https://github.com/orgs/atzaero/projects/2); PR com `Closes #N` e `--assignee elvisea` ao abrir (`/pr`).
- Repositório: **atzaero/aerobi-api** (NestJS).

## Quando Usar

- Antes de criar um commit (`/commit`)
- Antes de abrir um pull request (`/pr`)
- Ao receber uma solicitação de revisão de código

## Workflow

1. **Coletar diff** — executar `git diff` e `git diff --cached` para ver todas as mudanças
2. **Identificar escopo** — entender quais módulos/features foram afetados
3. **Aplicar checklist** — verificar cada categoria relevante às mudanças
4. **Reportar problemas** — listar issues encontrados com arquivo e linha
5. **Sugerir correções** — propor solução para cada problema encontrado
6. **Aguardar aprovação** — não prosseguir com commit/PR sem resolução dos problemas críticos
7. **Revisão automatizada (opcional)** — para relatório estruturado 🔴/🟡/🔵 com `arquivo:linha`, invocar o subagente `code-reviewer` conforme [`.claude/agents/code-reviewer.md`](../agents/code-reviewer.md) (também referenciado por `/complete-flow`).

Problemas são classificados em:

- **Crítico** — bloqueia commit (segurança, bug, quebra de contrato)
- **Aviso** — recomenda correção, mas não bloqueia
- **Sugestão** — melhoria opcional

## Verificação com Docker

Quando o diff alterar persistência, Prisma, integrações HTTP ou comportamento dependente de Postgres, preferir validar **dentro do container**:

```bash
docker compose -f docker-compose.dev.yml run --rm api npm run test
```

Para inspeção manual: `docker compose -f docker-compose.dev.yml run --rm api bash`.

## Checklist

### TypeScript

- [ ] Evitar `any` sem justificativa; preferir tipos explícitos ou generics
- [ ] Contratos de entrada/saída claros (DTOs, tipos de retorno de serviços)
- [ ] Funções assíncronas com retorno tipado (`Promise<T>`)
- [ ] Sem `@ts-ignore` sem comentário que explique o motivo

### NestJS

- [ ] Módulos com responsabilidade clara; imports mínimos necessários
- [ ] Controllers finos — delegam regras ao service
- [ ] Services com lógica de negócio; side-effects e I/O bem isolados
- [ ] Validação de entrada (class-validator / pipes) onde aplicável
- [ ] Guards e autorização em rotas sensíveis
- [ ] Exceções HTTP consistentes (filtros globais quando existirem)
- [ ] Configuração via `ConfigModule` / env; **sem** secrets hardcoded

### Prisma e dados

- [ ] Migrações coerentes com o schema; evitar estados irreversíveis sem rollback
- [ ] Queries sem N+1 desnecessário; transações quando operações forem atómicas
- [ ] Não expor detalhes internos do DB em mensagens de erro ao cliente

### API HTTP

- [ ] Métodos e códigos de status adequados ao contrato REST do módulo
- [ ] Documentação Swagger atualizada se o projeto expuser OpenAPI
- [ ] Rate limiting / autenticação alinhados ao padrão existente no repo

### Testes

- [ ] Testes unitários cobrem branches críticos novos ou alterados

### Segurança

- [ ] Inputs validados; sem concatenação insegura em queries
- [ ] Logs sem dados sensíveis (tokens, passwords, PII desnecessária)
- [ ] Dependências sensíveis revistas (`npm audit` / política do projeto)

### Performance

- [ ] Evitar trabalho pesado síncrono em hot paths sem necessidade
- [ ] Cache ou batching apenas onde o código já estabelece esse padrão
