# mappers

Converte entidades do Prisma (`PilotLanding`) em DTOs de resposta.

## Arquivo

- `pilot-landing.mapper.ts` — classe `PilotLandingMapper` com:
  - `static toApiRow(entity)` — 1 entidade → 1 DTO.
  - `static toApiRows(entities)` — N entidades → N DTOs.

## Regras

- Métodos estáticos (sem dependências injetáveis).
- Nada de I/O. Só transformação pura.
- Services chamam o mapper antes de retornar.
