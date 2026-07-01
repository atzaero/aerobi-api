# services

Lógica de negócio. Um arquivo por operação.

## Arquivos

- `create-feedback.service.ts` — envio público (rate limit diário por `session_hash`).
- `summary-feedbacks.service.ts` — agregação pública por rating.
- `list-feedbacks.service.ts` — usa `resolvePaginationParams` + `FeedbacksPaginatedResponseDTO`.
- `find-feedback-by-id.service.ts`
- `remove-feedback.service.ts` — soft delete.
- `export-feedbacks.service.ts` — export CSV.

Cada service tem um `*.spec.ts` irmão.

## Padrão

- Classe `@Injectable()` com método único `.execute(input): Promise<output>`.
- Dependências (repository, outros services) injetadas como `private readonly` no construtor.
- Services orquestram: repository + mapper + validações + regras de negócio.
- Nunca tocam no `PrismaService` diretamente — sempre via repository.
