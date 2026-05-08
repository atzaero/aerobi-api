# controllers

Camada HTTP do módulo `landing-requests`. Um arquivo por operação.

## Arquivos

- `create-landing-request.controller.ts` — `POST /landing-requests`
- `update-landing-request.controller.ts` — `PATCH /landing-requests/:id`
- `list-landing-requests.controller.ts` — `GET /landing-requests` (paginado)
- `find-landing-request-by-id.controller.ts` — `GET /landing-requests/:id`
- `remove-landing-request.controller.ts` — `DELETE /landing-requests/:id` (soft delete)

Cada controller tem um `*.spec.ts` irmão.

## Regras

- Magros: recebem a request, delegam ao service em `../services` e retornam.
- Swagger via decoradores importados de `../docs` (`@CreateLandingRequestDocs()` etc.).
- Guard padrão: `@UseGuards(AerobiApiKeyGuard)` na classe.
- Sem lógica de negócio — se você precisa transformar dados, faça no service ou mapper.
