# repositories

Única camada de acesso ao banco (Prisma). Não instanciar `PrismaService` em service ou controller.

## Arquivos

- `technical-visit.repository.interface.ts` — assinatura `ITechnicalVisitRepository`.
- `technical-visit.repository.ts` — implementação `TechnicalVisitRepository implements ITechnicalVisitRepository`.

## Convenções

- Métodos básicos: `create`, `update`, `findById`, `findMany`, `count`, `softDelete`.
- `softDelete` usa `deletedAt` + `deletedBy` (campos de auditoria do model).
- Registrar o repository como provider no `technical-visits.module.ts`.
- Se precisar de SQL cru, crie um `*.sql.ts` irmão (ver padrão em `src/modules/rab`).
