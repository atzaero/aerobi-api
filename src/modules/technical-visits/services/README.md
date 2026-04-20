# services

Lógica de negócio. Um arquivo por operação.

## Arquivos

- `create-technical-visit.service.ts`
- `update-technical-visit.service.ts`
- `list-technical-visits.service.ts` — usa `resolvePaginationParams` + `TechnicalVisitsPaginatedResponseDTO`.
- `find-technical-visit-by-id.service.ts`
- `remove-technical-visit.service.ts` — soft delete.

Cada service tem um `*.spec.ts` irmão.

## Padrão

- Classe `@Injectable()` com método único `.execute(input): Promise<output>`.
- Dependências (repository, outros services) injetadas como `private readonly` no construtor.
- Services orquestram: repository + mapper + validações + regras de negócio.
- Nunca tocam no `PrismaService` diretamente — sempre via repository.
