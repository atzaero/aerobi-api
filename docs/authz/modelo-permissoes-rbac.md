# Modelo de permissões (RBAC) — backend Aerobi API

> **Documento de paridade.** Espelha a política canônica do front
> (`aerobi-web`), traduzindo-a para a stack da API (NestJS + Prisma). A **fonte
> de verdade do código** no backend é
> [`src/modules/auth/permissions/permissions.ts`](../../src/modules/auth/permissions/permissions.ts)
> (`can()` / `rolesFor()` / `PERMISSIONS`). Ao alterar a política, mude os **três**
> juntos: este doc, o `permissions.ts` da API e o par no front (ver
> [Paridade web ↔ api](#paridade-web--api)).

## Fonte canônica e paridade

A política RBAC nasce no produto (diagrama do Figma _"Modelo de ordem
hierárquica"_, Section 3) e tem como **fonte canônica** o documento do front:

- **Front (canônico):**
  [`atzaero/aerobi` → `docs/refatoracao-admin/modelo-permissoes-rbac.md`](https://github.com/atzaero/aerobi/blob/main/docs/refatoracao-admin/modelo-permissoes-rbac.md)
  — implementação em `src/lib/permissions.ts`.
- **Backend (este doc):** porta a mesma matriz para `permissions.ts` da API.

A matriz abaixo é **consistente célula a célula** com `permissions.ts`. Onde
houver dúvida entre doc e código, **o código (`permissions.ts`) vence** e este
doc deve ser corrigido.

## Modelo hierárquico

```
Administrador
   └─ Coordenador
        ├─ Operador
        │     └─ Vistoriador (técnico)
        └─ Vistoriador (técnico)
```

A hierarquia é **cumulativa**: cada nível superior tem as permissões dos
inferiores **mais** as próprias. O coordenador herda funções de operador e
vistoriador; o operador herda as do vistoriador. Não há herança "mágica" no
código — a cumulatividade está **materializada** na matriz: cada célula lista
explicitamente todos os papéis autorizados.

### Tabela de papéis (front lowercase ↔ backend MAIÚSCULAS)

O front usa papéis em `lowercase` (string); o backend usa o enum Prisma
`UserRole` em `MAIÚSCULAS`. A tradução é 1:1:

| Função (diagrama) | Front (`string`) | Backend (`UserRole`) |
| ----------------- | ---------------- | -------------------- |
| Administrador     | `admin`          | `ADMIN`              |
| Coordenador       | `coordinator`    | `COORDINATOR`        |
| Operador          | `operator`       | `OPERATOR`           |
| Vistoriador       | `technical`      | `TECHNICAL`          |

### Resumo por função

- **Administrador** (`ADMIN`) — usuário master: todas as funcionalidades. Cria
  aeródromos e grupos, cadastra administradores e coordenadores.
- **Coordenador** (`COORDINATOR`) — vê/modifica dados e documentos de
  aeródromos; libera/fecha visualização (`is_view`) e pousos/decolagens
  (`is_open`); adiciona/remove operadores e vistoriadores; herda operador e
  vistoriador.
- **Operador** (`OPERATOR`) — aceita/recusa solicitações de pouso; visualiza
  aeródromos e documentos; adiciona observação pública; baixa PDF de visita
  técnica; consulta RAB; herda vistoriador.
- **Vistoriador / técnico** (`TECHNICAL`) — adiciona, edita e remove visitas
  técnicas; baixa PDF de visitas técnicas.

## Matriz papel × entidade × ação

✓ = permitido. Ausência de uma ação ⇒ ninguém pode (**deny-by-default**, idem
ao front). A coluna **Backend** indica a paridade da entidade com a infra atual:

- **rota/tabela** — já existe módulo + model Prisma correspondente (a política
  está pronta para ser ligada ao guard quando a migração acontecer).
- **preparado** — a entidade existe na política, mas **ainda não há** tabela/rota
  dedicada no backend (a política antecipa a implementação futura).

| Entidade · Ação                                                               | admin | coordinator | operator | técnico | Backend     |
| ----------------------------------------------------------------------------- | :---: | :---------: | :------: | :-----: | ----------- |
| **group** · list / read                                                       |   ✓   |      ✓      |          |         | rota/tabela |
| **group** · create / update / delete                                          |   ✓   |             |          |         | rota/tabela |
| **user** · list                                                               |   ✓   |      ✓      |          |         | rota/tabela |
| **user** · create                                                             |   ✓   |     ✓ ¹     |          |         | rota/tabela |
| **user** · delete                                                             |   ✓   |     ✓ ¹     |          |         | rota/tabela |
| **user** · update _(reset de senha)_                                          |   ✓   |             |          |         | rota/tabela |
| **audit** · list / read                                                       |   ✓   |      ✓      |          |         | preparado   |
| **aerodrome** · list / read                                                   |   ✓   |      ✓      |    ✓     |    ✓    | rota/tabela |
| **aerodrome** · create                                                        |   ✓   |      ✓      |          |         | rota/tabela |
| **aerodrome** · update _(dados **+** toggles is_open/is_view/weather/lit)_    |   ✓   |      ✓      |          |         | rota/tabela |
| **aerodrome** · update-observation _(observação pública)_                     |   ✓   |      ✓      |    ✓     |         | rota/tabela |
| **aerodrome** · delete _(soft delete)_                                        |   ✓   |             |          |         | rota/tabela |
| **document** · list / read                                                    |   ✓   |      ✓      |    ✓     |         | preparado ⁴ |
| **document** · create / update                                                |   ✓   |      ✓      |          |         | preparado ⁴ |
| **document** · delete                                                         |   ✓   |             |          |         | preparado ⁴ |
| **landing_request** · list / read / decide _(aceitar/recusar)_                |   ✓   |      ✓      |    ✓     |         | rota/tabela |
| **technical_visit** · list / read / create / update / delete / export _(PDF)_ |   ✓   |      ✓      |    ✓     |    ✓    | rota/tabela |
| **maintenance** · list / read / create / update                               |   ✓   |      ✓      |          |         | preparado   |
| **maintenance** · delete                                                      |   ✓   |             |          |         | preparado   |
| **task** · list / read / create / update                                      |   ✓   |      ✓      |          |         | preparado   |
| **task** · delete                                                             |   ✓   |             |          |         | preparado   |
| **feedback** · list / read / delete _(moderação)_ ²                           |   ✓   |      ✓      |          |         | rota/tabela |
| **rab** · read _(consultar RAB)_                                              |   ✓   |      ✓      |    ✓     |         | rota/tabela |
| **aviascan_reading** · list / read _(leituras de matrículas)_ ³               |   ✓   |      ✓      |          |         | rota/tabela |
| **dashboard** · read _(dashboard por papel)_ ⁵                                |   ✓   |      ✓      |    ✓     |    ✓    | preparado   |

¹ **Recorte por role-alvo** (regra de negócio na camada de serviço, **não** nesta
matriz): admin cadastra `ADMIN`/`COORDINATOR`; coordinator adiciona/remove apenas
`OPERATOR`/`TECHNICAL`.

² **Feedback** entra na matriz só pela **moderação** (listar e remover
avaliações abusivas/spam). O **envio** da avaliação e o **resumo público**
(contagem positivos/negativos) são fluxos **públicos/anônimos** — não passam por
papel (ver [Acesso público ≠ RBAC](#acesso-público--rbac)).

³ **AviaScan reading** (leituras de matrículas) — no backend é o módulo
`readings` (model `AircraftReading`), somente leitura. O upstream autentica pela
`X-API-Key` compartilhada (sem recorte por usuário), então o gate por papel é o
**único** filtro de quem pode consultar.

⁴ **Document** — a política antecipa o CRUD de documentos do aeródromo, mas
ainda **não** há model/rota dedicada (`document`) no backend; entra como
**preparado**.

⁵ **Dashboard** — entidade **exclusiva do backend** (`dashboard`, só `read`):
todo papel autenticado lê a própria dashboard; o recorte de dados e o escopo por
registro são resolvidos server-side. Não consta na matriz do front (que controla
visibilidade de UI de outro modo). É uma **divergência conhecida** — ao
consolidar a paridade, alinhar com o front ou documentar como backend-only
definitivo.

## Notas de implementação

### Escopo por registro ≠ matriz

A matriz é só o gate **`papel × entidade × ação`**. O **escopo por registro**
(coordinator/operator restritos ao **próprio grupo**) **não vive aqui** — é
resolvido server-side a partir do `aerodromeGroupId` do token, e é o objeto da
**epic #204** (`GroupScopeGuard`), **nunca** a partir do payload do cliente.
Ver o cabeçalho de `permissions.ts`.

### Controllers ainda sob `AerobiApiKeyGuard`

A maioria dos controllers protege-se por **`AerobiApiKeyGuard`** (header
`X-API-Key`) e **ainda não consome** esta política. A matriz é a **fundação**
(guards/services/testes consomem `can()` / `rolesFor()`); a ligação desses
controllers ao RBAC por papel é **migração futura**. Até lá, o `permissions.ts`
serve como contrato e é a referência de paridade com o front.

### Registro do guard: controller-level vs `APP_GUARD` (decisão #209)

O `PermissionsGuard` pode ser ligado de duas formas. O **piloto `users/`**
(#209) adota o **controller-level**; o `APP_GUARD` global fica para o futuro:

| Abordagem | Prós | Contras |
| --- | --- | --- |
| **Controller-level** (`@UseGuards(JwtAuthGuard, PermissionsGuard)` + `@RequirePermission(...)` por controller) — **adotado agora** | Explícito; **não toca** nas rotas `X-API-Key`; convive com `AerobiApiKeyGuard`; opt-in rota a rota durante a migração | Verboso (repete `@UseGuards`/`@RequirePermission`) |
| **`APP_GUARD` global** | DRY (um registro cobre tudo) | Aplicar-se-ia a **todas** as rotas, incluindo as `X-API-Key` — exigiria `@Public()`/bypass em massa antes da migração; arriscado |

**Recomendação:** manter **controller-level** enquanto coexistirem rotas
`X-API-Key` e rotas RBAC humanas. A migração para `APP_GUARD` só compensa
depois que a maioria dos controllers estiver sob `JwtAuthGuard` e houver um
`@Public()` consistente para o que ficar fora.

> **Recorte por role-alvo ≠ matriz.** O `PermissionsGuard` resolve só o gate
> papel × ação. O recorte por **role-alvo** (nota ¹) é regra de negócio na
> camada de serviço — em `users/` está em
> [`assertCanManageTargetRole`](../../src/modules/users/utils/user-access.util.ts),
> consumido por `create-user`, `remove-user` e `resend-invite`.

#### Piloto `users/` — mapa aplicado

| Controller | Guard | Permissão | Recorte no service |
| --- | --- | --- | --- |
| `list-users` | `JwtAuthGuard, PermissionsGuard` | `user:list` | — (escopo por grupo é #204) |
| `create-user` | `JwtAuthGuard, PermissionsGuard` | `user:create` | `assertCanManageTargetRole` |
| `remove-user` | `JwtAuthGuard, PermissionsGuard` | `user:delete` | `assertCanManageTargetRole` |
| `resend-invite` | `JwtAuthGuard, PermissionsGuard` | `user:create` | `assertCanManageTargetRole` |
| `update-user` | `JwtAuthGuard` (inalterado) | — | `assertSelfOrAdmin` (self **ou** ADMIN) |
| `find-user-by-id` | `JwtAuthGuard` (inalterado) | — | `assertSelfOrAdmin` |

`update-user` e `find-user-by-id` **não** migram para `@RequirePermission`: são
endpoints **self-or-admin** (o próprio dono edita/lê o seu registro). A matriz
não tem `user:read`, e `user:update` é ADMIN-only (reset de senha) — aplicá-la
quebraria o self-service. A parte ADMIN-only (mudar role) permanece no service
(`ROLE_CHANGE_FORBIDDEN`).

### Acesso público ≠ RBAC

Fluxos **públicos** ficam fora desta matriz:

- **Manutenção:** stakeholders visualizam tarefas e enviam palpites/sugestões
  autenticados por `security_code` + lista de `authorized_emails` (sem papel). O
  RBAC cobre só a gestão interna de `maintenance`/`task`.
- **Feedback (avaliação do aeródromo):** o **envio** é anônimo (limitado por
  `session_hash` + ICAO) e o **resumo** (contagem de positivos/negativos) é
  leitura pública — nenhum dos dois usa papel. O RBAC cobre só a **moderação**.

### Deny-by-default

Qualquer combinação ausente da matriz é negada (`can()` devolve `false` para
papel nulo, string vazia, papel fora da lista ou ação não listada). O papel
`TECHNICAL` só tem `technical_visit` (+ `aerodrome` leitura e `dashboard`).

## Paridade web ↔ api

| Camada  | Política (código)                                                                                  | Doc                                                           |
| ------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Front   | `aerobi-web` → `src/lib/permissions.ts`                                                            | `docs/refatoracao-admin/modelo-permissoes-rbac.md` (canônico) |
| Backend | [`src/modules/auth/permissions/permissions.ts`](../../src/modules/auth/permissions/permissions.ts) | este doc                                                      |

Documento do front (fonte canônica):
[`atzaero/aerobi` → `docs/refatoracao-admin/modelo-permissoes-rbac.md`](https://github.com/atzaero/aerobi/blob/main/docs/refatoracao-admin/modelo-permissoes-rbac.md).

Ao mudar a política, atualize os pares dos **dois** lados (web e api) juntos.
