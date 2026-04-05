# Módulo Plugfield (proxy)

Proxy HTTP para a API vendor [Plugfield](https://wdg.plugfield.com.br/doc-api/index.html). Variáveis e rotas: ver comentários em `plugfield.module.ts` e README raiz do repositório.

## Saídas (tipagens) — estado atual

As respostas expostas pela **aerobi-api** são **propositalmente genéricas**:

| Área | Tipo de retorno (TypeScript) |
|------|------------------------------|
| Login, associate, device por id | `Record<string, unknown>` |
| Lista de devices | `Record<string, unknown>[]` |
| Dados (`daily` / `hourly` / `sensor`) | `PlugfieldDataResult` = `Record<string, unknown> \| unknown[]` |

**Por quê**

1. **Sem OpenAPI importável** — O JSON OpenAPI oficial da Plugfield não está disponível publicamente (tentativas a `swagger.json` / `v3/api-docs` retornam 403). Não gerámos tipos nem DTOs a partir do spec deles.
2. **Contrato vendor opaco** — A forma exata dos JSON pode variar por conta, versão ou endpoint. Fixar DTOs rígidos no Nest sem o schema oficial arrisca **falsos negativos** na validação ou documentação desatualizada.
3. **Frontend** — O projeto **Next** (`aerobi-web`) continua a validar entradas/saídas relevantes com **Zod** nas server actions em `src/app/actions/plugfield`. Isso é independente dos tipos deste módulo Nest.

**Swagger** — Os exemplos em `docs/plugfield-response.examples.ts` são **ilustrativos** (não copiados do OpenAPI da Plugfield). Servem para leitura humana no Swagger UI da nossa API.

## Melhorias posteriores (sugestões)

Quando existir **acesso ao OpenAPI oficial** ou amostras estáveis de resposta:

1. **Gerar tipos** a partir do OpenAPI (openapi-typescript, ou similar) e usá-los nos services, **ou**
2. **Definir DTOs de resposta Nest** (`class-validator` + `@ApiProperty`) com o subconjunto de campos que a Aerobi quer suportar oficialmente, e opcionalmente **mapear/validar** o JSON bruto da Plugfield para esses DTOs (aceitando o risco de mudanças no vendor).

Até lá, manter saídas genéricas + exemplos documentais mantém o proxy **tolerante** e evita duplicar contratos incertos entre Nest e Next.
