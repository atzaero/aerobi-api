# services

Lógica de negócio. Um arquivo por operação.

## Arquivos

- `create-geojson.service.ts`
- `update-geojson.service.ts`
- `list-geojsons.service.ts` — usa `resolvePaginationParams` + `GeojsonsPaginatedResponseDTO`.
- `find-geojson-by-id.service.ts`
- `remove-geojson.service.ts` — soft delete.

Cada service tem um `*.spec.ts` irmão.

## Padrão

- Classe `@Injectable()` com método único `.execute(input): Promise<output>`.
- Dependências (repository, outros services) injetadas como `private readonly` no construtor.
- Services orquestram: repository + mapper + validações + regras de negócio.
- Nunca tocam no `PrismaService` diretamente — sempre via repository.
