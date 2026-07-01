# controllers

Camada HTTP do módulo `aerodrome-feedbacks`. Um arquivo por operação.

## Rotas públicas (envio anônimo + resumo)

Sem login humano — protegidas apenas pela `X-API-Key` (`@UseGuards(AerobiApiKeyGuard)`).

- `create-aerodrome-feedback.controller.ts` — `POST /aerodrome-feedbacks` (envio anônimo; `feedbackDate`/`createdBy` derivados no servidor; rate-limit → 409)
- `summary-aerodrome-feedbacks.controller.ts` — `GET /aerodrome-feedbacks/summary` (contadores públicos)

## Rotas internas (moderação)

`@UseGuards(JwtAuthGuard, PermissionsGuard[, GroupScopeGuard])` + `@RequirePermission('feedback', ...)`. Escopo por grupo: ADMIN vê tudo; COORDINATOR só o próprio grupo.

- `list-aerodrome-feedbacks.controller.ts` — `GET /aerodrome-feedbacks` (`feedback:list`; escopo no service)
- `export-aerodrome-feedbacks.controller.ts` — `GET /aerodrome-feedbacks/export` (`feedback:export`; escopo no service)
- `find-aerodrome-feedback-by-id.controller.ts` — `GET /aerodrome-feedbacks/:id` (`feedback:read` + `@RequiresGroupScope`)
- `remove-aerodrome-feedback.controller.ts` — `DELETE /aerodrome-feedbacks/:id` (`feedback:delete` + `@RequiresGroupScope`; soft delete com `deletedBy` real)

Cada controller tem um `*.spec.ts` irmão. `/summary` e `/export` são registrados **antes** de `/:id` no módulo (Express 5 não tem regex no param).

## Regras

- Magros: recebem a request, delegam ao service em `../services` e retornam.
- Swagger via decoradores importados de `../docs` (`@CreateAerodromeFeedbackDocs()` etc.).
- Sem lógica de negócio — se você precisa transformar dados, faça no service ou mapper.
