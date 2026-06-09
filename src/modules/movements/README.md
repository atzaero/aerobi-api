# Módulo `readings`

Leituras de matrícula de aeronaves reconhecidas por OCR (pipeline **aviascan-cv** →
**aerobi-api**). Recebe as leituras, persiste em **Postgres** (model
`AircraftReading`) e guarda as imagens no **MinIO** (object storage S3), servindo-as
ao frontend via **presigned URLs**.

Substitui o antigo proxy `aviascan` (que apenas encaminhava para um backend
Express/MariaDB externo) por persistência própria.

## Endpoints

Todos sob `@UseGuards(AerobiApiKeyGuard)` (header `X-API-Key`).

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/readings` | Ingestão **single** (multipart). Compatível com o cliente Python. |
| `POST` | `/readings/batch` | Ingestão em **lote** (multipart, `images[]` + `metadata` JSON). |
| `GET` | `/readings` | Lista **paginada** (`{ data, meta }`), filtros opcionais. |
| `GET` | `/readings/:readingId` | Busca por id. |
| `DELETE` | `/readings/:readingId` | Soft delete. |

### Contrato de entrada (compat Python)

`POST /readings` é `multipart/form-data` com campos em **snake_case** (fiel ao
`aviascan-cv`): `registration`, `confidence`, `reading_datetime` (obrigatórios),
`aerodrome`, `reading_status`, `revisor_id`, `comments` (opcionais) e o arquivo
`image` (jpg/png/webp, ≤ 10 MB). Resposta: `{ id, message, image_path }`
(`image_path` = presigned URL ou `null`).

> O `reading_datetime` aceita ISO 8601. O cliente deve enviar com timezone (`Z`)
> para evitar interpretação no fuso do servidor.

### Lote

`POST /readings/batch`: `images[]` (≤ 50) + `metadata` (string JSON) com um array
de itens; cada item tem os mesmos campos do single + `image_index` (0-based)
referenciando `images[]`. Processado com concorrência limitada e resiliente a
falha parcial — resposta `{ created, failed, items: [{ index, status, id?, image_path?, error? }] }`.

### Saída das consultas (camelCase)

`GET /readings` e `GET /readings/:id` retornam `AircraftReadingResponseDTO` em
camelCase (`readingDatetime`, `imageUrl` = presigned, etc.). Filtros do `GET`:
`registration`, `aerodrome`, `reading_status`, `start_date`/`end_date`
(`YYYY-MM-DD`), `page`/`limit`.

## Storage (MinIO)

Usa o `StorageModule` (`@/modules/storage`). Keys no layout
`readings/YYYY/MM/<uuid>.<ext>`; o banco guarda a **key** (`imageKey`), não a URL.
A presigned URL é derivada sob demanda (best-effort: falha ao assinar → `null`,
sem derrubar a operação).

Variáveis (ver `.env.example`): `STORAGE_PROVIDER`, `MINIO_ENDPOINT`,
`MINIO_PUBLIC_ENDPOINT` (assina presigned com host acessível ao navegador),
`MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET_READINGS`, `MINIO_REGION`.

## Estrutura

Segue o padrão do projeto (ver `landing-requests`): `controllers/`, `services/`,
`repositories/`, `dtos/`, `mappers/`, `docs/` (Swagger), `utils/`. Documentação
HTTP completa em `/api/docs` (tag **Readings**).
