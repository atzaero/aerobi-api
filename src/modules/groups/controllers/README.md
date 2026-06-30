# controllers

Camada HTTP do módulo `groups`. Um arquivo por operação.

## Arquivos

- `create-group.controller.ts` — `POST /groups`
- `update-group.controller.ts` — `PATCH /groups/:id`
- `list-groups.controller.ts` — `GET /groups` (paginado)
- `find-group-by-id.controller.ts` — `GET /groups/:id`
- `remove-group.controller.ts` — `DELETE /groups/:id` (soft delete)

Cada controller tem um `*.spec.ts` irmão.

## Regras

- Magros: recebem a request, delegam ao service em `../services` e retornam.
- Swagger via decoradores importados de `../docs` (`@CreateGroupDocs()` etc.).
- Guard padrão: `@UseGuards(JwtAuthGuard, PermissionsGuard)` na classe; `find-group-by-id` adiciona `GroupScopeGuard` (`@RequiresGroupScope(GroupScopeSubject.GROUP)`).
- Sem lógica de negócio — se você precisa transformar dados, faça no service ou mapper.
