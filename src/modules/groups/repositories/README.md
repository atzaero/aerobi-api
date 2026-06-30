# repositories

Única camada de acesso ao banco (Prisma). Não instanciar `PrismaService` em service ou controller.

## Arquivos

- `group.repository.interface.ts` — assinatura `IGroupRepository`.
- `group.repository.ts` — implementação `GroupRepository implements IGroupRepository`.

## Convenções

- Métodos básicos: `create`, `update`, `findById`, `findMany`, `count`, `softDelete`.
- `softDelete` usa `deletedAt` + `deletedBy` (campos de auditoria do model).
- Registrar o repository como provider no `groups.module.ts`.
- Se precisar de SQL cru, crie um `*.sql.ts` irmão (ver padrão em `src/modules/rab`).
