# docs

Decoradores Swagger agrupados. Um arquivo `*.docs.ts` por controller.

## Arquivos

- `create-operational-aerodrome.docs.ts`
- `update-operational-aerodrome.docs.ts`
- `list-operational-aerodromes.docs.ts`
- `find-operational-aerodrome-by-id.docs.ts`
- `remove-operational-aerodrome.docs.ts`
- `index.ts` — barril que reexporta todos.

## Padrão

Cada arquivo exporta uma função nomeada (`{Operacao}Docs()`) que retorna `applyDecorators(...)`
com `@ApiOperation`, `@ApiSecurity`, `@ApiParam/@ApiQuery`, `@ApiOkResponse` etc.

Mantém o controller limpo e os decoradores reaproveitáveis.
