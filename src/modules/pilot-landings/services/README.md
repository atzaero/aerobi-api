# services

Lógica de negócio. Um arquivo por operação.

## Arquivos

- `create-pilot-landing.service.ts`
- `update-pilot-landing.service.ts`
- `list-pilot-landings.service.ts` — usa `resolvePaginationParams` + `PilotLandingsPaginatedResponseDTO`.
- `find-pilot-landing-by-id.service.ts`
- `remove-pilot-landing.service.ts` — soft delete.

Cada service tem um `*.spec.ts` irmão.

## Padrão

- Classe `@Injectable()` com método único `.execute(input): Promise<output>`.
- Dependências (repository, outros services) injetadas como `private readonly` no construtor.
- Services orquestram: repository + mapper + validações + regras de negócio.
- Nunca tocam no `PrismaService` diretamente — sempre via repository.
