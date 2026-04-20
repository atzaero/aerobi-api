# mappers

Converte entidades do Prisma (`AerodromeGeojson`) em DTOs de resposta.

## Arquivo

- `aerodrome-geojson.mapper.ts` — classe `AerodromeGeojsonMapper` com:
  - `static toApiRow(entity)` — 1 entidade → 1 DTO.
  - `static toApiRows(entities)` — N entidades → N DTOs.

## Regras

- Métodos estáticos (sem dependências injetáveis).
- Nada de I/O. Só transformação pura.
- Services chamam o mapper antes de retornar.
