# controllers

Camada HTTP do módulo `pilot-landings`. Um arquivo por operação.

## Arquivos

- `create-pilot-landing.controller.ts` — `POST /pilot-landings`
- `update-pilot-landing.controller.ts` — `PATCH /pilot-landings/:id`
- `list-pilot-landings.controller.ts` — `GET /pilot-landings` (paginado)
- `find-pilot-landing-by-id.controller.ts` — `GET /pilot-landings/:id`
- `remove-pilot-landing.controller.ts` — `DELETE /pilot-landings/:id` (soft delete)

Cada controller tem um `*.spec.ts` irmão.

## Regras

- Magros: recebem a request, delegam ao service em `../services` e retornam.
- Swagger via decoradores importados de `../docs` (`@CreatePilotLandingDocs()` etc.).
- Guard padrão: `@UseGuards(AerobiApiKeyGuard)` na classe.
- Sem lógica de negócio — se você precisa transformar dados, faça no service ou mapper.
