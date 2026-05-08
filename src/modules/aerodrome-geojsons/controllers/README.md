# controllers

Camada HTTP do módulo `aerodrome-geojsons`. Um arquivo por operação.

## Arquivos

- `create-aerodrome-geojson.controller.ts` — `POST /aerodrome-geojsons`
- `update-aerodrome-geojson.controller.ts` — `PATCH /aerodrome-geojsons/:id`
- `list-aerodrome-geojsons.controller.ts` — `GET /aerodrome-geojsons` (paginado)
- `find-aerodrome-geojson-by-id.controller.ts` — `GET /aerodrome-geojsons/:id`
- `remove-aerodrome-geojson.controller.ts` — `DELETE /aerodrome-geojsons/:id` (soft delete)

Cada controller tem um `*.spec.ts` irmão.

## Regras

- Magros: recebem a request, delegam ao service em `../services` e retornam.
- Swagger via decoradores importados de `../docs` (`@CreateAerodromeGeojsonDocs()` etc.).
- Guard padrão: `@UseGuards(AerobiApiKeyGuard)` na classe.
- Sem lógica de negócio — se você precisa transformar dados, faça no service ou mapper.
