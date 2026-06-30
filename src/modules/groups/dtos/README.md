# dtos

DTOs de entrada e saída, validados com `class-validator` e documentados com `@ApiProperty`.

## Arquivos

- `create-group.dto.ts` — body de `POST` (também usado como input do service).
- `update-group.dto.ts` — body de `PATCH`.
- `list-groups-query.dto.ts` — query de `GET`; extende `BasePaginationQueryDTO`.
- `group-response.dto.ts` — resposta de item único.
- `groups-paginated-response.dto.ts` — resposta de listagem; extende `BasePaginatedResponseDTO`.

## Padrão

- Listagens **sempre** usam `BasePaginatedResponseDTO<T>` (`@/common/dtos/base-paginated-response.dto`).
- DTOs de entrada do controller podem ser reutilizados como entrada do service quando a forma bate. Quando o service precisa de campos extras (ex.: `id` no update, `deletedBy` no remove), exporte um tipo no próprio service.
