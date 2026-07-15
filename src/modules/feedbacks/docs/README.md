# docs

Decoradores Swagger agrupados. Um arquivo `*.docs.ts` por controller.

## Arquivos

- `create-feedback.docs.ts` — envio público (`X-API-Key`).
- `summary-feedbacks.docs.ts` — agregação pública (`X-API-Key`).
- `list-feedbacks.docs.ts` — moderação interna (JWT + escopo).
- `find-feedback-by-id.docs.ts` — moderação interna (JWT + escopo).
- `remove-feedback.docs.ts` — moderação interna (JWT + escopo).
- `export-feedbacks.docs.ts` — export CSV interno (JWT + escopo).
- `index.ts` — barril que reexporta todos.

## Padrão

Cada arquivo exporta uma função nomeada (`{Operacao}Docs()`) que retorna `applyDecorators(...)`
com `@ApiOperation`, `@ApiSecurity`, `@ApiParam/@ApiQuery`, `@ApiOkResponse` etc.

Mantém o controller limpo e os decoradores reaproveitáveis.
