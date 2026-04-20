# controllers

Camada HTTP do módulo `aerodrome-groups`. Um arquivo por operação.

## Arquivos

- `create-aerodrome-group.controller.ts` — `POST /aerodrome-groups`
- `update-aerodrome-group.controller.ts` — `PATCH /aerodrome-groups/:id`
- `list-aerodrome-groups.controller.ts` — `GET /aerodrome-groups` (paginado)
- `find-aerodrome-group-by-id.controller.ts` — `GET /aerodrome-groups/:id`
- `remove-aerodrome-group.controller.ts` — `DELETE /aerodrome-groups/:id` (soft delete)

Cada controller tem um `*.spec.ts` irmão.

## Regras

- Magros: recebem a request, delegam ao service em `../services` e retornam.
- Swagger via decoradores importados de `../docs` (`@CreateAerodromeGroupDocs()` etc.).
- Guard padrão: `@UseGuards(AerobiApiKeyGuard)` na classe.
- Sem lógica de negócio — se você precisa transformar dados, faça no service ou mapper.
