# docs

Decoradores Swagger agrupados. Um arquivo `*.docs.ts` por controller.

## Arquivos

- `create-group.docs.ts`
- `update-group.docs.ts`
- `list-groups.docs.ts`
- `find-group-by-id.docs.ts`
- `remove-group.docs.ts`
- `index.ts` — barril que reexporta todos.

## Padrão

Cada arquivo exporta uma função nomeada (`{Operacao}Docs()`) que retorna `applyDecorators(...)`
com `@ApiOperation`, `@ApiSecurity`, `@ApiParam/@ApiQuery`, `@ApiOkResponse` etc.

Mantém o controller limpo e os decoradores reaproveitáveis.
