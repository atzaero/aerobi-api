# dtos

DTOs de entrada e saída, validados com `class-validator` e documentados com `@ApiProperty`.

## Arquivos

- `create-feedback.dto.ts` — body de `POST` público (também usado como input do service).
- `feedback-param.dto.ts` — path param `:id` das rotas internas.
- `list-feedbacks-query.dto.ts` — query de `GET` (listagem interna); extende `BasePaginationQueryDTO`.
- `feedback-filter-query.dto.ts` — filtros partilhados entre listagem e export.
- `export-feedbacks-query.dto.ts` — query do export CSV.
- `feedback-summary-query.dto.ts` — query do summary público.
- `feedback-summary-response.dto.ts` — resposta do summary (agregação por rating).
- `feedback-response.dto.ts` — resposta de item único.
- `feedbacks-paginated-response.dto.ts` — resposta de listagem; extende `BasePaginatedResponseDTO`.

## Padrão

- Listagens **sempre** usam `BasePaginatedResponseDTO<T>` (`@/common/dtos/base-paginated-response.dto`).
- DTOs de entrada do controller podem ser reutilizados como entrada do service quando a forma bate. Quando o service precisa de campos extras (ex.: `deletedBy` no remove), exporte um tipo no próprio service.
