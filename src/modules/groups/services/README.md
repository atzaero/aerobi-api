# services

Lógica de negócio. Um arquivo por operação.

## Arquivos

- `create-group.service.ts`
- `update-group.service.ts`
- `list-groups.service.ts` — usa `resolvePaginationParams` + `GroupsPaginatedResponseDTO`.
- `find-group-by-id.service.ts`
- `remove-group.service.ts` — soft delete.

Cada service tem um `*.spec.ts` irmão.

## Padrão

- Classe `@Injectable()` com método único `.execute(input): Promise<output>`.
- Dependências (repository, outros services) injetadas como `private readonly` no construtor.
- Services orquestram: repository + mapper + validações + regras de negócio.
- Nunca tocam no `PrismaService` diretamente — sempre via repository.
