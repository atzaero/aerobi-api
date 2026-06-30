# controllers

Camada HTTP do módulo `aerodromes`. Um arquivo por operação.

## Arquivos

- `create-aerodrome.controller.ts` — `POST /aerodromes`
- `update-aerodrome.controller.ts` — `PATCH /aerodromes/:id`
- `list-aerodromes.controller.ts` — `GET /aerodromes` (paginado)
- `find-aerodrome-by-id.controller.ts` — `GET /aerodromes/:id`
- `remove-aerodrome.controller.ts` — `DELETE /aerodromes/:id` (soft delete)

Cada controller tem um `*.spec.ts` irmão.

## Regras

- Magros: recebem a request, delegam ao service em `../services` e retornam.
- Swagger via decoradores importados de `../docs` (`@CreateAerodromeDocs()` etc.).
- Guard padrão: `@UseGuards(AerobiApiKeyGuard)` na classe.
- Sem lógica de negócio — se você precisa transformar dados, faça no service ou mapper.
