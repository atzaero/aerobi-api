# services

Lógica de negócio. Um arquivo por operação.

## Arquivos

- `create-camera.service.ts`
- `update-camera.service.ts`
- `list-cameras.service.ts` — usa `resolvePaginationParams` + `CamerasPaginatedResponseDTO`.
- `find-camera-by-id.service.ts`
- `remove-camera.service.ts` — soft delete.

Cada service tem um `*.spec.ts` irmão.

## Padrão

- Classe `@Injectable()` com método único `.execute(input): Promise<output>`.
- Dependências (repository, outros services) injetadas como `private readonly` no construtor.
- Services orquestram: repository + mapper + validações + regras de negócio.
- Nunca tocam no `PrismaService` diretamente — sempre via repository.
