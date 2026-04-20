# services

Lógica de negócio. Um arquivo por operação.

## Arquivos

- `create-landing-request.service.ts`
- `update-landing-request.service.ts`
- `list-landing-requests.service.ts` — usa `resolvePaginationParams` + `LandingRequestsPaginatedResponseDTO`.
- `find-landing-request-by-id.service.ts`
- `remove-landing-request.service.ts` — soft delete.

Cada service tem um `*.spec.ts` irmão.

## Padrão

- Classe `@Injectable()` com método único `.execute(input): Promise<output>`.
- Dependências (repository, outros services) injetadas como `private readonly` no construtor.
- Services orquestram: repository + mapper + validações + regras de negócio.
- Nunca tocam no `PrismaService` diretamente — sempre via repository.
