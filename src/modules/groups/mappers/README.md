# mappers

Converte entidades do Prisma (`Group`) em DTOs de resposta.

## Arquivo

- `group.mapper.ts` — classe `GroupMapper` com:
  - `static toApiRow(entity, imageUrl?)` — 1 entidade → 1 DTO (com a `imageUrl`
    presigned já resolvida; default `null`).
  - `static toDeletionResult(entity, affectedAerodromes, imageUrl?)` — projeção
    do soft-delete (grupo + contagem da cascata).
- `group.prisma.mapper.ts` — monta os inputs Prisma (create/patch).
- `group-export.columns.ts` — colunas do export CSV.

## Regras

- Métodos estáticos (sem dependências injetáveis).
- Nada de I/O. Só transformação pura.
- Services chamam o mapper antes de retornar.
