# services

Lógica de negócio. Um arquivo por operação.

## Arquivos

- `create-aerodrome-group.service.ts`
- `update-aerodrome-group.service.ts`
- `list-aerodrome-groups.service.ts` — usa `resolvePaginationParams` + `AerodromeGroupsPaginatedResponseDTO`.
- `find-aerodrome-group-by-id.service.ts`
- `remove-aerodrome-group.service.ts` — soft delete.

Cada service tem um `*.spec.ts` irmão.

## Padrão

- Classe `@Injectable()` com método único `.execute(input): Promise<output>`.
- Dependências (repository, outros services) injetadas como `private readonly` no construtor.
- Services orquestram: repository + mapper + validações + regras de negócio.
- Nunca tocam no `PrismaService` diretamente — sempre via repository.
