# services

Lógica de negócio. Um arquivo por operação.

## Arquivos

- `create-aerodrome.service.ts`
- `update-aerodrome.service.ts`
- `list-aerodromes.service.ts` — usa `resolvePaginationParams` + `AerodromesPaginatedResponseDTO`.
- `find-aerodrome-by-id.service.ts`
- `remove-aerodrome.service.ts` — soft delete.

Cada service tem um `*.spec.ts` irmão.

## Padrão

- Classe `@Injectable()` com método único `.execute(input): Promise<output>`.
- Dependências (repository, outros services) injetadas como `private readonly` no construtor.
- Services orquestram: repository + mapper + validações + regras de negócio.
- Nunca tocam no `PrismaService` diretamente — sempre via repository.
