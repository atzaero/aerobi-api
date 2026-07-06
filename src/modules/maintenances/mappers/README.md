# mappers

Transformações puras: entidade Prisma → DTO HTTP, e DTO de entrada → `Prisma.*CreateInput` / `UpdateInput`.

## Arquivos

- `maintenance.mapper.ts` — `MaintenanceMapper`: `toApiRow`, `toApiRows`.
- `maintenance.prisma.mapper.ts` — funções nomeadas (`buildMaintenanceCreateInput`, `patchMaintenanceToPrisma`) chamadas pelos services de create/update; testáveis com Jest em isolamento.

## Regras

- Sem I/O nem `@Injectable()`.
- Services chamam o mapper HTTP antes de retornar; create/update também usam o prisma mapper antes do repository.
