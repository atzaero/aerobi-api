# Scaffold de Módulo (NestJS + Prisma)

Gera a estrutura básica de um módulo CRUD HTTP a partir de um model Prisma, seguindo o padrão
do projeto `aerobi-api`. Equivalente a `nest g resource`, porém com as camadas extras do projeto
(docs, mappers, repository+interface, utils, specs) prontas — sem lógica de negócio.

## Contexto atzaero

- **Repositório:** **aerobi-api** — `atzaero/aerobi-api` (NestJS 11 + Prisma 7 + Postgres).
- **Padrão de referência:** [`src/modules/rab/`](../../src/modules/rab) e [`src/modules/public-aerodromes/`](../../src/modules/public-aerodromes).
- **Script gerador:** [`scripts/scaffold-module.mjs`](../../scripts/scaffold-module.mjs) — falha se a pasta destino já existir.

## Quando usar

- Uma nova tabela foi adicionada ao `prisma/schema.prisma` e precisa virar módulo HTTP.
- Você quer CRUD padrão (`create` / `update` / `list` / `find-by-id` / `remove`) como ponto de partida.
- Você vai implementar a lógica depois — este comando **apenas** cria os esqueletos.

## Pré-condições

- [ ] Model Prisma correspondente já existe em `prisma/schema.prisma` e tem `id`, `deletedAt`, `deletedBy` (auditoria padrão do projeto).
- [ ] `npm run prisma:generate` executado (tipos em `src/generated/prisma/client` disponíveis).
- [ ] Nenhuma pasta em `src/modules/<pasta>` com o mesmo nome.

## Entradas

| Arg | Descrição | Exemplo |
|---|---|---|
| `<Model>` | Nome do model Prisma em PascalCase | `AerodromeGroup` |
| `<pasta-plural>` | Pasta do módulo em kebab-case plural | `aerodrome-groups` |
| `<entidade-singular>` | Nome singular em kebab-case (usado em arquivos) | `aerodrome-group` |
| `<"Api Tag">` | Tag do Swagger (Title Case entre aspas) | `"Aerodrome Groups"` |

## Estrutura gerada

```
src/modules/<pasta-plural>/
├── <pasta-plural>.module.ts
├── controllers/
│   ├── README.md
│   ├── create-<entidade>.controller.ts          (+ .spec.ts)
│   ├── update-<entidade>.controller.ts          (+ .spec.ts)
│   ├── list-<pasta-plural>.controller.ts         (+ .spec.ts)
│   ├── find-<entidade>-by-id.controller.ts      (+ .spec.ts)
│   └── remove-<entidade>.controller.ts          (+ .spec.ts)
├── docs/
│   ├── README.md
│   ├── index.ts
│   └── (5 arquivos *.docs.ts — um por controller)
├── dtos/
│   ├── README.md
│   ├── create-<entidade>.dto.ts
│   ├── update-<entidade>.dto.ts
│   ├── list-<pasta-plural>-query.dto.ts          (extends BasePaginationQueryDTO)
│   ├── <entidade>-response.dto.ts
│   └── <pasta-plural>-paginated-response.dto.ts  (extends BasePaginatedResponseDTO)
├── mappers/
│   ├── README.md
│   └── <entidade>.mapper.ts                      (static toApiRow / toApiRows)
├── repositories/
│   ├── README.md
│   ├── <entidade>.repository.interface.ts       (I<Pascal>Repository)
│   └── <entidade>.repository.ts                  (implements a interface)
├── services/
│   ├── README.md
│   └── (5 arquivos *.service.ts + 5 *.spec.ts — um por operação)
└── utils/
    └── README.md
```

## Convenções do scaffold

- **1 controller / service / docs / spec por operação** (create, update, list, find-by-id, remove).
- **Nomes verbosos** de arquivo: `create-<entidade>.*`, `update-<entidade>.*`, etc.
- Controllers todos com `@Controller('<pasta-plural>')` + `@UseGuards(AerobiApiKeyGuard)` + `@ApiTags('<Api Tag>')`.
- Services usam **método canônico `.execute(input)`**.
- Listagens usam **`BasePaginatedResponseDTO<T>`** + `BasePaginationQueryDTO` + `resolvePaginationParams()`.
- Interface do repository em `repositories/<entidade>.repository.interface.ts` (não em `contracts/`).
- `remove` é **soft delete** — o esqueleto já usa `deletedAt` + `deletedBy`.
- Todos os métodos de negócio vêm com `// TODO: implementar`. Nada de lógica real.

## Workflow

1. **Confirmar entradas com o usuário** — model, pasta, entidade e tag.

2. **Gerar o scaffold:**

   ```bash
   node scripts/scaffold-module.mjs <Model> <pasta-plural> <entidade-singular> "<Api Tag>"
   ```

   Exemplo:

   ```bash
   node scripts/scaffold-module.mjs AerodromeGroup aerodrome-groups aerodrome-group "Aerodrome Groups"
   ```

3. **Registrar em `src/app.module.ts`** — adicionar o import e a entrada na array `imports` (ordem alfabética).

4. **Validar:**

   ```bash
   npm run build
   npm run lint
   npm test
   ```

5. **Commitar:** usar o fluxo `/commit` — mensagem sugerida `chore(scaffold): módulo <pasta> (CRUD scaffold)`.

## Regras

- ❌ **NUNCA** inferir campos dos DTOs/response — deixe `// TODO`.
- ❌ **NUNCA** implementar lógica no service/repository no scaffold — só esqueleto.
- ❌ **NUNCA** tocar em `prisma/schema.prisma` a partir deste comando.
- ✅ Sempre registrar o módulo em `app.module.ts` logo após gerar.
- ✅ Sempre rodar `npm run build` antes de commitar — o scaffold precisa compilar.

## Quando NÃO usar

- Módulo não-CRUD (proxy, sync, batch etc.) — use o padrão do `rab/` ou `plugfield/` manualmente.
- Model Prisma ainda não existe — adicione ao schema e rode `prisma:generate` antes.
- Entidade sem campos de auditoria (`deletedAt`/`deletedBy`) — o scaffold assume soft delete.
