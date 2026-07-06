# services

Lógica de negócio. Um arquivo por operação.

## Arquivos

- `create-maintenance.service.ts`
- `update-maintenance.service.ts`
- `list-maintenances.service.ts` — usa `resolvePaginationParams` + `MaintenancesPaginatedResponseDTO`.
- `find-maintenance-by-id.service.ts`
- `remove-maintenance.service.ts` — soft delete.

Cada service tem um `*.spec.ts` irmão.

## Padrão

- Classe `@Injectable()` com método único `.execute(input): Promise<output>`.
- Dependências (repository, outros services) injetadas como `private readonly` no construtor.
- Services orquestram: repository + mapper + validações + regras de negócio.
- Nunca tocam no `PrismaService` diretamente — sempre via repository.
