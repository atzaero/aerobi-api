# controllers

Camada HTTP do módulo `cameras`. Um arquivo por operação.

## Arquivos

- `create-camera.controller.ts` — `POST /cameras`
- `update-camera.controller.ts` — `PATCH /cameras/:id`
- `list-cameras.controller.ts` — `GET /cameras` (paginado)
- `find-camera-by-id.controller.ts` — `GET /cameras/:id`
- `remove-camera.controller.ts` — `DELETE /cameras/:id` (soft delete)

Cada controller tem um `*.spec.ts` irmão.

## Regras

- Magros: recebem a request, delegam ao service em `../services` e retornam.
- Swagger via decoradores importados de `../docs` (`@CreateCameraDocs()` etc.).
- Guards (autenticação humana JWT): `@UseGuards(JwtAuthGuard, PermissionsGuard[, GroupScopeGuard])` na classe + `@RequirePermission('camera', <ação>)` por rota. As rotas com `:id` (get/update/delete) somam `GroupScopeGuard` + `@RequiresGroupScope(GroupScopeSubject.CAMERA)`; create/list resolvem o escopo do ator no service.
- Sem lógica de negócio — se você precisa transformar dados, faça no service ou mapper.
