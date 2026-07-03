# Módulo `audit` — trilha de auditoria

Trilha **append-only** das ações de escrita (CREATE/UPDATE/DELETE) sobre as
entidades do domínio. Paridade comportamental com o audit do `aerobi-web`
(coleção `auditLogs` no Firestore) e **fundação transversal** para os próximos
módulos da migração Firebase→API (epic #353, passo 2/13, execução #367).

## Duas superfícies

| Superfície | O quê | Autorização |
|---|---|---|
| **Escrita** (`AuditRecorderService`) | interna, injetada nos módulos que fazem mutações | — (sem rota HTTP; evita falsificação de trilha) |
| **Leitura** (`GET /audit-logs`, `/audit-logs/export`, `/audit-logs/:id`) | list paginada, export CSV, detalhe | `audit:list/read/export` = ADMIN/COORDINATOR |

**Sem escopo de grupo** na leitura: ADMIN e COORDINATOR veem **todos** os logs
(paridade com o web — audit é transversal e nem todo log tem grupo).

## Modelo (`AuditLog`)

Append-only: **sem** soft-delete/updated (um log não se edita nem se apaga). Os
campos `actor*` são **snapshot** no momento da ação e **nullable** (cobrem ação
pública/sistêmica sem login). `actorId` não tem FK rígida para `users.id` por ora
(mesmo tratamento do uid Firebase legado — ver `AGENTS.md`). `before`/`after`/
`metadata` são `jsonb` opcionais (omitidos = NULL). Índices alinham com os filtros
(`entityType,entityId,createdAt`; `actorEmail`; `action`; `createdAt`).

## Como instrumentar um módulo novo (padrão canônico)

Toda mutação (create/update/delete e sub-operações) grava a trilha. O padrão,
espelhando os call-sites do web, está implementado em `groups` e `users`:

1. **Módulo**: `imports: [AuditModule]` (exporta `AuditRecorderService`).
2. **Controller**: capta `@Req() request` e monta o contexto (ator + ip +
   user-agent), repassando ao service:
   ```ts
   handle(@Body() dto, @CurrentUser() actor: AuthenticatedUser, @Req() request: Request) {
     return this.service.execute(dto, actor, buildAuditContext(actor, request));
   }
   ```
3. **Service**: após a mutação, grava a trilha (o `before` só existe aqui —
   estado pré-mutação). **Best-effort**: `record` nunca lança (a auditoria não
   pode derrubar a operação de negócio).
   ```ts
   await this.auditRecorder.record(
     { action: AuditAction.UPDATE, entityType: 'group', entityId: id,
       before: snapshot(existing), after: snapshot(updated) },
     auditContext,
   );
   ```
4. **Snapshot**: um helper puro (`groupAuditSnapshot`, `userAuditSnapshot`)
   projeta só campos identificadores/administráveis — **nunca** segredos
   (password) nem dados voláteis (URLs presigned que expiram).

### Convenções de conteúdo

- **`action`** só assume `CREATE | UPDATE | DELETE`. Sub-operações
  (SET_STATUS, DECIDE, RESET_PASSWORD, INVITE, …) **não** viram novas actions:
  entram em `metadata` (ex.: `{ scope: 'reset-password' }`), como no web.
- **`before`/`after`** são recortes **parciais** (só os campos relevantes):
  CREATE sem `before`, DELETE sem `after`.
- **`entityType`** é tipado no call-site (`AuditEntityType`, em
  `constants/audit-entity-type.ts`) e persistido como `String`. Ao migrar um
  módulo novo, adicione seu tipo canônico (snake_case, singular) lá **e** o
  rótulo pt-BR em `mappers/audit-labels.ts`.

## Export CSV

6 colunas com rótulos pt-BR (Data/Hora UTC, Ação, Entidade, ID da entidade,
Ator, Papel), BOM UTF-8 + CRLF + escape RFC 4180, teto `EXPORT_MAX_ROWS`
(50 000, sinalizado via `X-Export-Truncated`/`X-Export-Total`), arquivo
`auditoria-YYYY-MM-DD.csv`. Corrige o bug de rótulo do web (`landing_request`
em snake_case; cobre os 11 `entityType` reais).

## Follow-ups (fora do escopo desta entrega)

- Instrumentar os demais módulos ao migrarem (cada sub-issue da #353 inclui o
  `record` correspondente).
- Interceptor automático `@Auditable()` (proposta original #151), opcional.
- FK `actorId → users.id` (`onDelete: SetNull`) quando a migração de uid legado
  for resolvida.
- Backfill Firestore→Postgres da coleção `auditLogs`.
- Cutover do `aerobi-web` (trocar `recordAudit`/`listAuditLogs`/… por HTTP).
