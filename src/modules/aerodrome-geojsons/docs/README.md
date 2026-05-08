# docs

Decoradores Swagger agrupados. Um arquivo `*.docs.ts` por controller.

## Arquivos

- `create-aerodrome-geojson.docs.ts`
- `update-aerodrome-geojson.docs.ts`
- `list-aerodrome-geojsons.docs.ts`
- `find-aerodrome-geojson-by-id.docs.ts`
- `remove-aerodrome-geojson.docs.ts`
- `index.ts` — barril que reexporta todos.

## Padrão

Cada arquivo exporta uma função nomeada (`{Operacao}Docs()`) que retorna `applyDecorators(...)`
com `@ApiOperation`, `@ApiSecurity`, `@ApiParam/@ApiQuery`, `@ApiOkResponse` etc.

Mantém o controller limpo e os decoradores reaproveitáveis.
