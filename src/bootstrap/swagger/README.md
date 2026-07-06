# Swagger / OpenAPI — guia canônico

Como o `aerobi-api` organiza e documenta a API em `/api/docs`. **Fonte única** — ao
criar/alterar um módulo, siga este documento; não invente ordem de seção nem estilo
de decorator próprio. A configuração vive em
[`setup-swagger.ts`](./setup-swagger.ts); os decoradores por rota vivem em
`docs/*.docs.ts` dentro de cada módulo.

## Princípio: a ordem das seções conta uma história

Cada `@ApiTags('X')` vira uma **seção** no Swagger UI. O UI renderiza as seções na
ordem em que as tags são declaradas no array `TAGS` de `setup-swagger.ts` — **não**
na ordem em que os módulos são registados em `app.module.ts`. Sem uma entrada em
`TAGS`, a seção do módulo cai no fim, em ordem arbitrária.

A ordem segue o **fluxo real de uso**, em blocos:

| Bloco | Seções (nesta ordem) | Racional |
|---|---|---|
| **Identidade & acesso** | Auth · Users · Invites · Password Reset | primeiro autentica-se e gere-se quem acede |
| **Estrutura (cadeia de dependência)** | Groups → Aerodromes → Cameras → Streams → Geojsons | monta-se a hierarquia: grupo → aeródromo → recursos filhos |
| **Operações & solicitações** | Landing Requests · Pilot Landings · Technical Visits · Movements · Readings · Feedbacks · Contact | o que se faz sobre a estrutura montada |
| **Integrações externas** | ANAC · RAB · Public Aerodromes · Private Aerodromes · AISWEB · Plugfield | proxies e sync ANAC/DECEA — dados que vêm de fora |
| **Sistema** | Audit · Health | transversal / observabilidade |

> Regra de ouro para posicionar uma seção nova: **onde ela entra na jornada de quem
> usa a API?** Se depende de outra entidade existir primeiro, vem **depois** dela.

## Nomenclatura da tag

- **Title Case, plural, em inglês**: `Groups`, `Aerodromes`, `Landing Requests`.
  Espelha o nome do domínio, não a rota (`/landing-requests` → `Landing Requests`).
- O valor tem de bater **exatamente** (byte a byte) entre três lugares: o
  `@ApiTags(...)` de todos os controllers do módulo, a entrada em `TAGS`
  (`setup-swagger.ts`) e o 4º argumento do scaffold (`"Groups"`).
- **1 módulo = 1 tag**, salvo quando o módulo serve **públicos/superfícies distintas**.
  Exceções legítimas já existentes: `users` expõe `Users` + `Invites` +
  `Password Reset`; `movements` expõe `Movements` (canônico) + `Readings` (ingestão
  edge). Cada tag extra também entra em `TAGS`, no bloco a que pertence.

## Decoradores por rota (`docs/*.docs.ts`)

O controller fica **limpo**: só `@ApiTags`, o verbo HTTP e o `@{Operacao}Docs()`.
Todo o resto (summary, respostas, segurança, params) mora numa função nomeada que
retorna `applyDecorators(...)` em `docs/{operacao}.docs.ts`. Um arquivo por ação;
`docs/index.ts` reexporta tudo.

```ts
// docs/create-group.docs.ts
export function CreateGroupDocs() {
  return applyDecorators(
    ApiBearerAuth(), // ou ApiSecurity('api_key') — ver tabela abaixo
    ApiOperation({
      summary: 'Cria um grupo de aeródromos',
      description: 'Requer permissão `group:create` (ADMIN).',
    }),
    ApiCreatedResponse({ type: GroupResponseDTO }),
    ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' }),
    ApiForbiddenResponse({ description: 'Sem permissão `group:create`.' }),
  );
}
```

```ts
// controllers/create-group.controller.ts
@ApiTags('Groups')
@Controller('groups')
export class CreateGroupController {
  @Post()
  @CreateGroupDocs()
  handle(/* … */) {}
}
```

### `@ApiOperation({ summary })`

- **Frase curta, verbo no infinitivo, pt-BR**: *"Cria um grupo"*, *"Lista paginada
  de aeródromos"*, *"Exporta feedbacks em CSV"*. É o texto que aparece na linha da
  rota — mantém-no informativo, sem ponto final decorativo desnecessário.
- `description` (opcional) para regras que não se leem na assinatura: permissão
  exigida, escopo, efeitos colaterais, formato de token.

### Segurança — casar o decorator com o guard real da rota

| Guard aplicado no controller | Decorator na doc | Aparece como |
|---|---|---|
| `AerobiApiKeyGuard` (X-API-Key) | `ApiSecurity('api_key')` | cadeado → campo **api_key** |
| `JwtAuthGuard` (+ permissões/escopo) | `ApiBearerAuth()` | cadeado → campo **bearer** |
| rota pública (sem guard) | *nenhum* | sem cadeado |

Os dois esquemas (`api_key`, `bearer`) são registados uma vez em `setup-swagger.ts`
(`addApiKey` / `addBearerAuth`). O decorator na doc só **referencia** o esquema para
pintar o cadeado certo — nunca redefine credenciais.

### Respostas

- Sempre o **tipo de sucesso**: `ApiOkResponse`/`ApiCreatedResponse({ type: XxxDTO })`.
- Documentar os **erros esperados** com o decorator específico
  (`ApiUnauthorizedResponse`, `ApiForbiddenResponse`, `ApiNotFoundResponse`,
  `ApiConflictResponse` …) e uma `description` curta do porquê.
- Paginação: `@ApiExtraModels` + `@ApiQuery` para os filtros (ver `list-*.docs.ts`).

## Checklist ao criar/alterar um módulo

1. **Scaffold** com a tag correta (4º arg, Title Case, entre aspas):
   `node scripts/scaffold-module.mjs Group groups group "Groups"`.
2. **Registre a tag em `TAGS`** (`setup-swagger.ts`), no **bloco certo** e na
   posição que respeita as dependências — não deixe cair no fim por omissão.
   Dê uma **descrição** de uma linha (aparece ao lado do título da seção).
3. **Ajuste o decorator de segurança** de cada `*.docs.ts` para o guard real
   (o scaffold assume `ApiSecurity('api_key')`; troque por `ApiBearerAuth()` se a
   rota for JWT, ou remova se for pública).
4. **`summary` humano** em cada `@ApiOperation` (o scaffold gera genérico).
5. Se a rota for pública, confirme que **não** carrega decorator de segurança.
6. Confira em `/api/docs` (ou `/api/docs-json`) que a seção nasce no lugar certo.

## Do / Don't

- ✅ Tag em `TAGS`, no bloco por dependência. ❌ deixar o módulo cair no fim sem entrada.
- ✅ Nome idêntico em `@ApiTags` / `TAGS` / scaffold. ❌ divergir maiúsculas/plural.
- ✅ Decoradores em `docs/*.docs.ts` via `applyDecorators`. ❌ empilhar `@Api*` no controller.
- ✅ Security decorator = guard real da rota. ❌ `api_key` numa rota JWT (cadeado mente).
- ✅ `summary` curto e informativo. ❌ deixar o texto genérico do scaffold.

## Referências no código

- Config + ordem das seções: [`setup-swagger.ts`](./setup-swagger.ts) (array `TAGS`,
  `DESCRIPTION` com os dois esquemas de auth).
- Molde de docs por rota: [`src/modules/groups/docs/`](../../modules/groups/docs/)
  (JWT) e [`src/modules/geojsons/docs/`](../../modules/geojsons/docs/) (X-API-Key).
- Scaffold: [`.claude/commands/scaffold-module.md`](../../../.claude/commands/scaffold-module.md)
  + `scripts/scaffold-module.mjs`.
