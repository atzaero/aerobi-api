# mappers

Converte entidades do Prisma (`AerodromeGroup`) em DTOs de resposta.

## Arquivo

- `aerodrome-group.mapper.ts` — classe `AerodromeGroupMapper` com:
  - `static toApiRow(entity, imageUrl?)` — 1 entidade → 1 DTO (com a `imageUrl`
    presigned já resolvida; default `null`).
  - `static toDeletionResult(entity, affectedAerodromes, imageUrl?)` — projeção
    do soft-delete (grupo + contagem da cascata).
- `aerodrome-group.prisma.mapper.ts` — monta os inputs Prisma (create/patch).
- `aerodrome-group-export.columns.ts` — colunas do export CSV.

## Regras

- Métodos estáticos (sem dependências injetáveis).
- Nada de I/O. Só transformação pura.
- Services chamam o mapper antes de retornar.
