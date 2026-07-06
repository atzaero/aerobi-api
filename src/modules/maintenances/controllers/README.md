# controllers

Camada HTTP do módulo `maintenances`. Um arquivo por operação.

## Arquivos

### Rotas internas (JWT)

- `create-maintenance.controller.ts` — `POST /maintenances`
- `update-maintenance.controller.ts` — `PATCH /maintenances/:id`
- `list-maintenances.controller.ts` — `GET /maintenances` (paginado)
- `find-maintenance-by-id.controller.ts` — `GET /maintenances/:id`
- `remove-maintenance.controller.ts` — `DELETE /maintenances/:id` (soft delete)
- `export-maintenances.controller.ts` — `GET /maintenances/export`
- `stats-maintenances.controller.ts` — `GET /maintenances/stats`
- `resend-maintenance-invitations.controller.ts` — `POST /maintenances/:id/resend-invitations`

### Rotas públicas (sem JWT)

- `public/get-public-maintenance-feedback.controller.ts` — `GET /public/maintenances/:id/feedback`
- `public/create-public-maintenance-guess.controller.ts` — `POST /public/maintenances/:id/guesses`

Cada controller interno tem um `*.spec.ts` irmão quando aplicável.

## Regras

- Magros: recebem a request, delegam ao service em `../services` e retornam.
- Swagger via decoradores importados de `../docs` (`@CreateMaintenanceDocs()` etc.).
- Rotas internas: `@UseGuards(JwtAuthGuard, PermissionsGuard, GroupScopeGuard)` na classe (quando há `:id` ou escopo).
- Rotas públicas: `@Public()` + `PublicMaintenanceRateLimitGuard` (rate limit por IP).
- Sem lógica de negócio — se você precisa transformar dados, faça no service ou mapper.
