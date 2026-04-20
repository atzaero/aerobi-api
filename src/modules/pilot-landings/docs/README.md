# docs

Decoradores Swagger agrupados. Um arquivo `*.docs.ts` por controller.

## Arquivos

- `create-pilot-landing.docs.ts`
- `update-pilot-landing.docs.ts`
- `list-pilot-landings.docs.ts`
- `find-pilot-landing-by-id.docs.ts`
- `remove-pilot-landing.docs.ts`
- `index.ts` — barril que reexporta todos.

## Padrão

Cada arquivo exporta uma função nomeada (`{Operacao}Docs()`) que retorna `applyDecorators(...)`
com `@ApiOperation`, `@ApiSecurity`, `@ApiParam/@ApiQuery`, `@ApiOkResponse` etc.

Mantém o controller limpo e os decoradores reaproveitáveis.
