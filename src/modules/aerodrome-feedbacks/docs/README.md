# docs

Decoradores Swagger agrupados. Um arquivo `*.docs.ts` por controller.

## Arquivos

- `create-aerodrome-feedback.docs.ts`
- `update-aerodrome-feedback.docs.ts`
- `list-aerodrome-feedbacks.docs.ts`
- `find-aerodrome-feedback-by-id.docs.ts`
- `remove-aerodrome-feedback.docs.ts`
- `index.ts` — barril que reexporta todos.

## Padrão

Cada arquivo exporta uma função nomeada (`{Operacao}Docs()`) que retorna `applyDecorators(...)`
com `@ApiOperation`, `@ApiSecurity`, `@ApiParam/@ApiQuery`, `@ApiOkResponse` etc.

Mantém o controller limpo e os decoradores reaproveitáveis.
