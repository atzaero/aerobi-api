# Módulo `movements`

**Movimentos** de aeronaves num aeródromo — cada registro é um **pouso**
(`LANDING`) ou uma **decolagem** (`TAKEOFF`), no jargão de aviação um
"movimento". Tem duas origens:

- **`AUTOMATIC`**: matrícula reconhecida por OCR a partir de uma imagem de câmera
  (pipeline **aviascan-cv** → **aerobi-api**), ingerida pelas rotas `/readings`.
- **`MANUAL`**: preenchido por um usuário pela interface humana (`POST /movements`).

Persiste em **Postgres** (model `Movement`) e guarda as imagens no **MinIO**
(object storage S3), servindo-as ao frontend via **presigned URLs**.

> O domínio nasceu como `readings` (leituras de matrícula). A epic #229
> generalizou para `movements`: o registro deixou de ser uma "leitura" e passou a
> ser um movimento tipado (pouso/decolagem) com origem automática **ou** manual.

## Modelo de dados

`prisma/schema.prisma` (final do ficheiro):

| Elemento | Tabela | Papel |
|----------|--------|-------|
| `Movement` | `movement` | O movimento em si: matrícula, `operationType`, `source`, `readingDatetime`, imagem (key MinIO), status de validação, `createdBy` ("inserido por"), `confidence` (opcional), auditoria/soft delete. |
| `MovementAircraftSnapshot` | `movement_aircraft_snapshot` | Snapshot **1:1** dos dados cadastrais (RAB) da aeronave **congelados** no instante do movimento (+ `rabRowId`/`rabPeriod` para rastreabilidade). |

Enums:

| Enum | Valores | Uso |
|------|---------|-----|
| `MovementType` | `LANDING`, `TAKEOFF` | Tipo de operação. |
| `MovementSource` | `AUTOMATIC`, `MANUAL` | Como o registro entrou no sistema. |

### Snapshot RAB

A `rab_row` (tabela RAB da ANAC) é periódica — chave `(period, marcas)` — e o
registro "atual" muda a cada período mensal. Por isso, no momento da criação,
copiamos um subconjunto curado dos campos do `rab_row` para o snapshot. Sem match
de matrícula, o snapshot é gravado vazio (campos `null`) e o movimento **não
falha** — apenas registramos um aviso. Detalhes em `mappers/aircraft-snapshot.prisma.mapper.ts`.

## Criação (fonte única: `CreateMovementService`)

Ambas as origens passam pelo mesmo `CreateMovementService` (`services/create-movement.service.ts`),
que resolve o snapshot RAB e o `operationType` **antes** do upload da imagem
(para não deixar imagem órfã se um lookup falhar) e compensa removendo a imagem
se o INSERT falhar.

A diferença está na **origem** (`services/movement-origin.ts`):

| Origem | Rotas | `operationType` | `createdBy` |
|--------|-------|-----------------|-------------|
| `AUTOMATIC` | `POST /readings`, `POST /readings/batch` | **inferido** (regra toggle de 48h) | fixo `'aviascan'` |
| `MANUAL` | `POST /movements` | vem do **formulário** | do corpo (opcional), até a auth humana chegar |

### Regra toggle de 48h (inferência do `operationType` em `AUTOMATIC`)

Só a origem `AUTOMATIC` infere o tipo de operação. Para a matrícula no aeródromo,
olha-se o **último** movimento ativo nas **48h** anteriores à leitura:

| Último movimento em 48h | `operationType` inferido |
|-------------------------|--------------------------|
| nenhum                  | `LANDING`                |
| `LANDING`               | `TAKEOFF`                |
| `TAKEOFF`               | `LANDING`                |

**Racional**: a aeronave alterna pouso↔decolagem; o toggle pelo **último** estado
reflete o ciclo operacional real (inferir só por "existe movimento → decolagem"
geraria duas decolagens seguidas). A janela de 48h evita encadear com operações
antigas; o primeiro avistamento (sem histórico em 48h) é `LANDING` — a aeronave
chegou. Em lote a inferência é best-effort (itens concorrentes usam o estado
visível no momento da consulta). Decisão registrada na epic #229.

## Endpoints

Todos sob `@UseGuards(AerobiApiKeyGuard)` (header `X-API-Key`).

### Ingestão automática (aviascan-cv) — `/readings`

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/readings` | Ingestão **single** (multipart). Origem `AUTOMATIC`. Compatível com o cliente Python. |
| `POST` | `/readings/batch` | Ingestão em **lote** (multipart, `images[]` + `metadata` JSON). |

### Criação manual — `/movements`

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/movements` | Criação **manual** pela interface (multipart). `operationType` obrigatório no corpo; `createdBy` opcional. |

### Consulta canônica — `/movements`

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/movements` | Lista **paginada** (`{ data, meta }`), filtros opcionais. |
| `GET` | `/movements/:movementId` | Busca por id. |
| `PATCH` | `/movements/:movementId` | Corrige a **matrícula** (único campo editável). |
| `DELETE` | `/movements/:movementId` | Soft delete. |

> **Edição da matrícula** (`UpdateMovementService`): caso de uso para corrigir
> leituras OCR equivocadas (imagem nítida, matrícula errada). Aceita a matrícula
> de forma tolerante (`PR-ZTT`, `PRZTT`, `PR ZTT`) e persiste na forma canônica
> (`PRZTT`) via `normalizeMarcas` — mesma decisão de domínio da criação. O
> **snapshot RAB é re-resolvido** para a matrícula corrigida (mantém a
> consistência matrícula↔aeronave). O `operationType` **não** é recomputado
> (a regra toggle de 48h só vale na ingestão). Sem alias legado em `/readings` —
> edição é funcionalidade nova; o cliente legado apenas cria.

### Consulta legada (DEPRECADO) — `/readings`

| Método | Rota | Estado |
|--------|------|--------|
| `GET` | `/readings` | **DEPRECADO** — alias de `GET /movements`. |
| `GET` | `/readings/:readingId` | **DEPRECADO** — alias de `GET /movements/:id`. |
| `DELETE` | `/readings/:readingId` | **DEPRECADO** — alias de `DELETE /movements/:id`. |

> As três rotas de **consulta** `/readings` continuam funcionais como alias do
> mesmo serviço (`@deprecated` no Swagger). As rotas de **ingestão** `POST /readings`
> e `POST /readings/batch` **não** são deprecadas — são o canal de entrada do
> aviascan-cv. Não confundir consulta (deprecada) com ingestão (mantida).

### Contrato de entrada `/readings` (compat Python)

`POST /readings` é `multipart/form-data` com campos em **snake_case** (fiel ao
`aviascan-cv`): `registration`, `confidence`, `reading_datetime` (obrigatórios),
`aerodrome`, `reading_status`, `revisor_id`, `comments` (opcionais) e o arquivo
`image` (jpg/png/webp, ≤ 10 MB). Resposta: `{ id, message, image_path }`
(`image_path` = presigned URL ou `null`).

> O `reading_datetime` aceita ISO 8601. O cliente deve enviar com timezone (`Z`)
> para evitar interpretação no fuso do servidor.

`POST /readings/batch`: `images[]` (≤ 50) + `metadata` (string JSON) com um array
de itens; cada item tem os mesmos campos do single + `image_index` (0-based)
referenciando `images[]`. Processado com concorrência limitada e resiliente a
falha parcial — resposta `{ created, failed, items: [{ index, status, id?, image_path?, error? }] }`.

### Saída das consultas (camelCase)

A **lista** `GET /movements` (e o alias `GET /readings`) retorna o item enxuto
`MovementListItemDTO` em camelCase — só o que o card mostra: `id`,
`registration`, `aerodrome` (ICAO), `readingDatetime`, `imageUrl` (presigned),
`operationType` e `source`. Não inclui `aircraftSnapshot`, `readingStatus`,
`revisorId`, `comments` nem `createdAt`/`updatedAt`. O **detalhe**
`GET /movements/:id` retorna o `MovementResponseDTO` completo (com o
`aircraftSnapshot` RAB, ou `null`). **`confidence` NÃO é exposto** em nenhuma das
consultas (decisão de produto — só faz sentido para movimentos `AUTOMATIC`).
Filtros do `GET` da lista: `registration`, `aerodrome`, `reading_status`,
`operation_type` (`LANDING`|`TAKEOFF`), `source` (`AUTOMATIC`|`MANUAL`),
`start_date`/`end_date` (`YYYY-MM-DD`), `page`/`limit`.

## Storage (MinIO)

Usa o `StorageModule` (`@/modules/storage`). Keys no layout
`readings/YYYY/MM/<uuid>.<ext>` — o prefixo `readings/` é **legado** e mantido por
ora (renomear para `movements/` está fora do escopo desta epic). O banco guarda a
**key** (`imageKey`), não a URL; a presigned URL é derivada sob demanda
(best-effort: falha ao assinar → `null`, sem derrubar a operação).

Variáveis (ver `.env.example`): `STORAGE_PROVIDER`, `MINIO_ENDPOINT`,
`MINIO_PUBLIC_ENDPOINT` (assina presigned com host acessível ao navegador),
`MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET`, `MINIO_REGION`.

## Estrutura

Segue o padrão do projeto: `controllers/`, `services/`, `repositories/`, `dtos/`,
`mappers/`, `docs/` (Swagger), `utils/`. Documentação HTTP completa em `/api/docs`
(tags **Movements** para as rotas canônicas e **Readings** para `/readings`).

## Coexistência `/readings` ↔ `/movements` e follow-ups

`/movements` é o caminho **canônico**; as rotas de **consulta** `/readings` são
**legado deprecado**, mantidas só para não quebrar consumidores atuais. Há
follow-ups **cross-repo**, fora desta epic:

1. **aviascan-cv**: pode passar a apontar para `/movements` quando conveniente —
   **hoje desnecessário**, a ingestão `POST /readings` (+ `/batch`) é mantida.
2. **aerobi-web**: migrar o consumo das consultas para `/movements` e, depois
   disso, aposentar o alias `/readings`.
