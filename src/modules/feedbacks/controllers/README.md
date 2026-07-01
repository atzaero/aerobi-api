# controllers

Camada HTTP do módulo `feedbacks`. Um arquivo por operação.

## Rotas públicas (envio anônimo + resumo)

Sem login humano — protegidas apenas pela `X-API-Key` (`@UseGuards(AerobiApiKeyGuard)`).

- `create-feedback.controller.ts` — `POST /feedbacks` (envio anônimo; `feedbackDate`/`createdBy` derivados no servidor; rate-limit → 409)
- `summary-feedbacks.controller.ts` — `GET /feedbacks/summary` (contadores públicos)

## Rotas internas (moderação)

`@UseGuards(JwtAuthGuard, PermissionsGuard[, GroupScopeGuard])` + `@RequirePermission('feedback', ...)`. Escopo por grupo: ADMIN vê tudo; COORDINATOR só o próprio grupo.

- `list-feedbacks.controller.ts` — `GET /feedbacks` (`feedback:list`; escopo no service)
- `export-feedbacks.controller.ts` — `GET /feedbacks/export` (`feedback:export`; escopo no service)
- `find-feedback-by-id.controller.ts` — `GET /feedbacks/:id` (`feedback:read` + `@RequiresGroupScope`)
- `remove-feedback.controller.ts` — `DELETE /feedbacks/:id` (`feedback:delete` + `@RequiresGroupScope`; soft delete com `deletedBy` real)

Cada controller tem um `*.spec.ts` irmão. `/summary` e `/export` são registrados **antes** de `/:id` no módulo (Express 5 não tem regex no param).

## Regras

- Magros: recebem a request, delegam ao service em `../services` e retornam.
- Swagger via decoradores importados de `../docs` (`@CreateFeedbackDocs()` etc.).
- Sem lógica de negócio — se você precisa transformar dados, faça no service ou mapper.
