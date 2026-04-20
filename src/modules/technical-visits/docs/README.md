# docs

Decoradores Swagger agrupados. Um arquivo `*.docs.ts` por controller.

## Arquivos

- `create-technical-visit.docs.ts`
- `update-technical-visit.docs.ts`
- `list-technical-visits.docs.ts`
- `find-technical-visit-by-id.docs.ts`
- `remove-technical-visit.docs.ts`
- `index.ts` — barril que reexporta todos.

## Padrão

Cada arquivo exporta uma função nomeada (`{Operacao}Docs()`) que retorna `applyDecorators(...)`
com `@ApiOperation`, `@ApiSecurity`, `@ApiParam/@ApiQuery`, `@ApiOkResponse` etc.

Mantém o controller limpo e os decoradores reaproveitáveis.
