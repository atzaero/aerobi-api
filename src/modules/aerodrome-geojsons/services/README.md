# services

Lógica de negócio. Um arquivo por operação.

## Arquivos

- `create-aerodrome-geojson.service.ts`
- `update-aerodrome-geojson.service.ts`
- `list-aerodrome-geojsons.service.ts` — usa `resolvePaginationParams` + `AerodromeGeojsonsPaginatedResponseDTO`.
- `find-aerodrome-geojson-by-id.service.ts`
- `remove-aerodrome-geojson.service.ts` — soft delete.

Cada service tem um `*.spec.ts` irmão.

## Padrão

- Classe `@Injectable()` com método único `.execute(input): Promise<output>`.
- Dependências (repository, outros services) injetadas como `private readonly` no construtor.
- Services orquestram: repository + mapper + validações + regras de negócio.
- Nunca tocam no `PrismaService` diretamente — sempre via repository.
