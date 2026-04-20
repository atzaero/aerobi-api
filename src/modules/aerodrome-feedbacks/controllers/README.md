# controllers

Camada HTTP do módulo `aerodrome-feedbacks`. Um arquivo por operação.

## Arquivos

- `create-aerodrome-feedback.controller.ts` — `POST /aerodrome-feedbacks`
- `update-aerodrome-feedback.controller.ts` — `PATCH /aerodrome-feedbacks/:id`
- `list-aerodrome-feedbacks.controller.ts` — `GET /aerodrome-feedbacks` (paginado)
- `find-aerodrome-feedback-by-id.controller.ts` — `GET /aerodrome-feedbacks/:id`
- `remove-aerodrome-feedback.controller.ts` — `DELETE /aerodrome-feedbacks/:id` (soft delete)

Cada controller tem um `*.spec.ts` irmão.

## Regras

- Magros: recebem a request, delegam ao service em `../services` e retornam.
- Swagger via decoradores importados de `../docs` (`@CreateAerodromeFeedbackDocs()` etc.).
- Guard padrão: `@UseGuards(AerobiApiKeyGuard)` na classe.
- Sem lógica de negócio — se você precisa transformar dados, faça no service ou mapper.
