# repositories

Única camada de acesso ao banco (Prisma). Não instanciar `PrismaService` em service ou controller.

## Arquivos

- `aerodrome-group.repository.interface.ts` — assinatura `IAerodromeGroupRepository`.
- `aerodrome-group.repository.ts` — implementação `AerodromeGroupRepository implements IAerodromeGroupRepository`.

## Convenções

- Métodos básicos: `create`, `update`, `findById`, `findMany`, `count`, `softDelete`.
- `softDelete` usa `deletedAt` + `deletedBy` (campos de auditoria do model).
- Registrar o repository como provider no `aerodrome-groups.module.ts`.
- Se precisar de SQL cru, crie um `*.sql.ts` irmão (ver padrão em `src/modules/rab`).
