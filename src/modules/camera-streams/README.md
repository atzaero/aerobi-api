# camera-streams — proxy HLS v2 (#473)

Listagem pública de câmeras por aeródromo e **proxy HLS passthrough** do mediamtx
(Raspi, via tailnet). É a **v2** do módulo [`streams`](../streams/README.md): a
diferença é a **fonte dos metadados** — lê do **Postgres** (módulo
[`cameras`](../cameras/), via `CameraQueryService`), não do Firestore.

Passo da epic #353 (migração Firebase → API). Estratégia **strangler-fig**: roda
**em paralelo** ao `streams` legado, sem tocar nele; o frontend (`atzaero/aerobi`)
migra no seu ritmo e a remoção do legado é a #474.

## Rotas (todas públicas — sem `X-API-Key`/JWT)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/aerodromes/:icao/camera-streams` | Câmeras ativas do aeródromo (`id`, `name`, `icao`, `streamUrl`) |
| GET | `/camera-streams/:cameraId/index.m3u8` | Master playlist HLS |
| GET | `/camera-streams/:cameraId/:segment` | Segmento (`*.m4s`/`*.mp4`) ou variante (`*.m3u8`) |

Prefixo `/camera-streams` distinto do legado (`/streams`, `/aerodromes/:icao/cameras`)
— zero colisão, migração de risco zero. `:cameraId` é o **UUID** do Postgres
(`Camera.id`), não mais o doc id do Firestore.

## Desenho

- **Fonte**: `CameraQueryService` (exportado por `CamerasModule`) — `findById`
  cacheado (TTL curto, positivo/negativo, inflight dedup) e `findEnabledByIcao`
  fresco. O CRUD de `cameras` **invalida** o cache a cada mutação.
- **Proxy**: `HlsProxyService` — passthrough de bytes (sem transcoding); repassa
  a query string do LL-HLS (`_HLS_msn`/`_HLS_part`) verbatim ao mediamtx para o
  *blocking reload*. Nunca vaza `mediamtxNode`/`mediamtxPath`.
- **Segurança**: revalida `mediamtxNode`/`mediamtxPath` (anti-SSRF/path traversal)
  no boundary de leitura, antes de montar a URL upstream — defense-in-depth mesmo
  com validação na escrita pelo CRUD.
- **Erros**: câmera inexistente/desativada/não-proxiável/offline → **404**;
  mediamtx fora/timeout → **502**; falha ao ler o Postgres (dependência interna)
  → 500 (via `AllExceptionsFilter`).

## Configuração

| Env | Default | Uso |
|-----|---------|-----|
| `CAMERA_STREAMS_CACHE_TTL_MS` | `60000` | TTL do cache de resolução (no `CameraQueryService`) |
| `CAMERA_STREAMS_PROXY_TIMEOUT_MS` | `10000` | Timeout da chamada HTTP ao mediamtx |
| `CAMERA_STREAMS_MEDIAMTX_HLS_PORT` | `8888` | Porta do servidor HLS do mediamtx |
