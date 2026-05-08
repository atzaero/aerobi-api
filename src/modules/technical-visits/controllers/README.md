# controllers

Camada HTTP do módulo `technical-visits`. Um arquivo por operação.

## Arquivos

- `create-technical-visit.controller.ts` — `POST /technical-visits`
- `update-technical-visit.controller.ts` — `PATCH /technical-visits/:id`
- `list-technical-visits.controller.ts` — `GET /technical-visits` (paginado)
- `find-technical-visit-by-id.controller.ts` — `GET /technical-visits/:id`
- `remove-technical-visit.controller.ts` — `DELETE /technical-visits/:id` (soft delete)

Cada controller tem um `*.spec.ts` irmão.

## Regras

- Magros: recebem a request, delegam ao service em `../services` e retornam.
- Swagger via decoradores importados de `../docs` (`@CreateTechnicalVisitDocs()` etc.).
- Guard padrão: `@UseGuards(AerobiApiKeyGuard)` na classe.
- Sem lógica de negócio — se você precisa transformar dados, faça no service ou mapper.
