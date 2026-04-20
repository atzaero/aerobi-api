# dtos

DTOs de entrada e saída, validados com `class-validator` e documentados com `@ApiProperty`.

## Arquivos

- `create-pilot-landing.dto.ts` — body de `POST` (também usado como input do service).
- `update-pilot-landing.dto.ts` — body de `PATCH`.
- `list-pilot-landings-query.dto.ts` — query de `GET`; extende `BasePaginationQueryDTO`.
- `pilot-landing-response.dto.ts` — resposta de item único.
- `pilot-landings-paginated-response.dto.ts` — resposta de listagem; extende `BasePaginatedResponseDTO`.

## Padrão

- Listagens **sempre** usam `BasePaginatedResponseDTO<T>` (`@/common/dtos/base-paginated-response.dto`).
- DTOs de entrada do controller podem ser reutilizados como entrada do service quando a forma bate. Quando o service precisa de campos extras (ex.: `id` no update, `deletedBy` no remove), exporte um tipo no próprio service.
