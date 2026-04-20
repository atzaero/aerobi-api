# controllers

Camada HTTP do módulo `operational-aerodromes`. Um arquivo por operação.

## Arquivos

- `create-operational-aerodrome.controller.ts` — `POST /operational-aerodromes`
- `update-operational-aerodrome.controller.ts` — `PATCH /operational-aerodromes/:id`
- `list-operational-aerodromes.controller.ts` — `GET /operational-aerodromes` (paginado)
- `find-operational-aerodrome-by-id.controller.ts` — `GET /operational-aerodromes/:id`
- `remove-operational-aerodrome.controller.ts` — `DELETE /operational-aerodromes/:id` (soft delete)

Cada controller tem um `*.spec.ts` irmão.

## Regras

- Magros: recebem a request, delegam ao service em `../services` e retornam.
- Swagger via decoradores importados de `../docs` (`@CreateOperationalAerodromeDocs()` etc.).
- Guard padrão: `@UseGuards(AerobiApiKeyGuard)` na classe.
- Sem lógica de negócio — se você precisa transformar dados, faça no service ou mapper.
