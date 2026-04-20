# repositories

Única camada de acesso ao banco (Prisma). Não instanciar `PrismaService` em service ou controller.

## Arquivos

- `operational-aerodrome.repository.interface.ts` — assinatura `IOperationalAerodromeRepository`.
- `operational-aerodrome.repository.ts` — implementação `OperationalAerodromeRepository implements IOperationalAerodromeRepository`.

## Convenções

- Métodos básicos: `create`, `update`, `findById`, `findMany`, `count`, `softDelete`.
- `softDelete` usa `deletedAt` + `deletedBy` (campos de auditoria do model).
- Registrar o repository como provider no `operational-aerodromes.module.ts`.
- Se precisar de SQL cru, crie um `*.sql.ts` irmão (ver padrão em `src/modules/rab`).
