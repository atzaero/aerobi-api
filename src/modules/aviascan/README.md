# Módulo AviaScan (proxy)

Proxy HTTP para a API [AviaScan](https://aviascanapi.lmpierin.com.br). Variáveis e rotas: ver comentários em `aviascan.module.ts` e README raiz do repositório.

**Autenticação:** o cliente envia apenas **`X-API-Key`** = **`AEROBI_API_KEY`** (guard partilhado com RAB, Plugfield e aeródromos privados). A `AVIASCAN_API_KEY` (opcional) existe só no backend e é enviada como header `x-api-key` para o upstream quando definida — o cliente nunca a envia.

## Rota

| Método | Rota Aerobi | Upstream encaminhado |
|--------|-------------|----------------------|
| `GET` | `/aviascan/readings/paginated` | `GET /api/readings/paginated` |

### Query params

Herdados de `BasePaginationQueryDTO` mais os filtros do upstream (todos opcionais):

| Param | Tipo | Descrição |
|-------|------|-----------|
| `page` | int (≥1, default 1) | Página |
| `limit` | int (1–200, default 10) | Itens por página |
| `registration` | string | Matrícula da aeronave |
| `aerodrome` | string | Código do aeródromo |
| `start_date` | string | Data inicial (`reading_datetime`) |
| `end_date` | string | Data final (`reading_datetime`) |

A resposta é o envelope `{ data, meta }` devolvido pelo upstream — a `meta`
(`currentPage`, `itemsPerPage`, `totalItems`, `totalPages`, `hasNextPage`,
`hasPreviousPage`) já segue o mesmo formato de paginação usado pela Aerobi.

## Saídas (tipagens)

O proxy encaminha a página tal como o upstream a devolve, após validar que o
envelope tem o shape esperado (`{ data: [], meta: {} }`). Formatos
irreconhecíveis resultam em `502 Bad Gateway`. Os DTOs em `dtos/` e o exemplo no
Swagger servem para documentação/leitura humana.

### `image_path` absoluto

O upstream devolve `image_path` **relativo** (ex: `/uploads/<uuid>.jpg`). O proxy
completa cada valor com a base URL da AviaScan, devolvendo uma URL absoluta
(ex: `https://aviascanapi.lmpierin.com.br/uploads/<uuid>.jpg`) — assim o cliente
carrega a imagem diretamente. Valores já absolutos (`http(s)://`) são mantidos.
Ver `utils/resolve-aviascan-image-url.util.ts`.
