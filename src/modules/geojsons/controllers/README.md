# controllers

Camada HTTP do módulo `geojsons`. Um arquivo por operação.

## Arquivos

- `create-geojson.controller.ts` — `POST /geojsons`
- `update-geojson.controller.ts` — `PATCH /geojsons/:id`
- `list-geojsons.controller.ts` — `GET /geojsons` (paginado)
- `find-geojson-by-id.controller.ts` — `GET /geojsons/:id`
- `remove-geojson.controller.ts` — `DELETE /geojsons/:id` (soft delete)

Cada controller tem um `*.spec.ts` irmão.

## Regras

- Magros: recebem a request, delegam ao service em `../services` e retornam.
- Swagger via decoradores importados de `../docs` (`@CreateGeojsonDocs()` etc.).
- Guard padrão: `@UseGuards(AerobiApiKeyGuard)` na classe.
- Sem lógica de negócio — se você precisa transformar dados, faça no service ou mapper.
