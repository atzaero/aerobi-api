# repositories

Única camada de acesso ao banco (Prisma). Não instanciar `PrismaService` em service ou controller.

## Arquivos

- `aerodrome-feedback.repository.interface.ts` — assinatura `IAerodromeFeedbackRepository`.
- `aerodrome-feedback.repository.ts` — implementação `AerodromeFeedbackRepository implements IAerodromeFeedbackRepository`.

## Convenções

- Métodos básicos: `create`, `update`, `findById`, `findMany`, `count`, `softDelete`.
- `softDelete` usa `deletedAt` + `deletedBy` (campos de auditoria do model).
- Registrar o repository como provider no `aerodrome-feedbacks.module.ts`.
- Se precisar de SQL cru, crie um `*.sql.ts` irmão (ver padrão em `src/modules/rab`).
