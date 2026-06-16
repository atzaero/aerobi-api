# Módulo `streams`

Listagem de câmeras por aeródromo e **proxy HLS** das câmeras — o usuário abre
uma página **pública** e vê o vídeo ao vivo (ex.: pátio de um aeródromo).

Implementa o **Caminho A** da épica [#317](https://github.com/atzaero/aerobi-api/issues/317):
desenho **Firestore-first**, sem tabela no Postgres e sem CRUD de câmeras neste
backend. Este módulo faz **apenas** duas coisas:

1. **Listar** câmeras de um aeródromo (lendo o Firestore).
2. Fazer **proxy** (passthrough de bytes) do HLS que o mediamtx do Raspi já
   serve via tailnet — **sem transcoding, sem ffmpeg**.

## Arquitetura

```
CADASTRO (sem backend):
  [tela no aerobi (front)]  ──►  [Firestore: collection `cameras`]
        atzaero/aerobi#1008          { icao, name, mediamtxNode, mediamtxPath, enabled }

PÁGINA PÚBLICA:
  [browser] ──► [Next.js] GET /aerodromes/:icao/cameras  (lista via server action)
     │
     │  (o player aponta DIRETO para a aerobi-api — rotas públicas, sem
     │   X-API-Key; cross-origin via CORS)
     ▼
  [aerobi-api  (público)]
     ├─ GET /aerodromes/:icao/cameras ─────► [Firestore]   (lê config; só enabled=true)
     └─ GET /streams/:cameraId/...    ─────► [Firestore]   (resolve config, com CACHE)
                                          └─► [mediamtx no Raspi :8888]  (HLS via tailnet)
                                                    │
                                                    ▼
                                          [câmera Intelbras na LAN local]  (RTSP, senha só no Raspi)
```

Pontos do desenho:

- **Visualização pública.** As rotas do módulo são **públicas** (sem
  `AerobiApiKeyGuard`): o conteúdo do vídeo é público, então o player aponta
  direto para a aerobi-api (cross-origin via CORS) — sem proxy/BFF intermediário
  no caminho quente. Abuso/banda ficam para a borda nginx (rate-limit/Referer) se
  necessário.
- **Sem credencial de câmera no backend.** O mediamtx no Raspi já entrega o HLS
  pronto; a senha RTSP nunca sai do Raspi. O Firestore guarda só o **ponteiro**:
  `{ icao, name, mediamtxNode, mediamtxPath, enabled }`.
- **Vínculo câmera↔aeródromo por código ICAO** (string), igual a
  `Movement.aerodrome`.
- **Passthrough puro.** O proxy faz `GET` em streaming no mediamtx e dá `pipe`
  direto no `Response` — sem materializar bytes em memória, sem transcoding.

## Endpoints

Rotas **públicas** (sem `X-API-Key`). Tag Swagger **Streams** em `/api/docs`.

| Método | Rota                            | Descrição                                                                  |
| ------ | ------------------------------- | -------------------------------------------------------------------------- |
| `GET`  | `/aerodromes/:icao/cameras`     | Lista câmeras **ativas** (`enabled=true`) do aeródromo, lendo o Firestore. |
| `GET`  | `/streams/:cameraId/index.m3u8` | Playlist HLS (proxy).                                                      |
| `GET`  | `/streams/:cameraId/:segment`   | Segmento HLS (`*.m4s`, `*.mp4`, `init.mp4`) — pipe direto.                 |

### Resposta da listagem

`GET /aerodromes/SBSP/cameras` →

```json
[
  {
    "id": "aero-mvp-cam-1",
    "name": "Pátio de aeronaves",
    "icao": "SBSP",
    "streamUrl": "/streams/aero-mvp-cam-1/index.m3u8"
  }
]
```

`streamUrl` é o **path relativo** da playlist no próprio aerobi-api — o front
prefixa o host **público** da API e entrega ao player HLS (as URLs relativas
dentro da playlist resolvem contra essa base). **Não** expomos `mediamtxNode`/
`mediamtxPath` (topologia interna da tailnet).

### Headers do proxy

| Sufixo  | `Content-Type`                  | `Cache-Control`                   |
| ------- | ------------------------------- | --------------------------------- |
| `.m3u8` | `application/vnd.apple.mpegurl` | `no-store` (playlist muda sempre) |
| `.m4s`  | `video/iso.segment`             | `max-age=10` (segmento imutável)  |
| `.mp4`  | `video/mp4`                     | `max-age=10`                      |

### Erros

| Status | Quando                                                                          |
| ------ | ------------------------------------------------------------------------------- |
| `404`  | Câmera inexistente, `enabled=false`, ou o mediamtx devolveu 404 (path offline). |
| `502`  | mediamtx inacessível (fora do ar) ou timeout (`STREAMS_PROXY_TIMEOUT_MS`).      |

## Cache da config da câmera

Cada player HLS pede um segmento a cada **~2-4s**. Resolver a câmera no Firestore
a cada segmento geraria uma consulta por segmento por espectador. Por isso o
`CameraResolverService` mantém um **cache em memória de TTL curto**
(`STREAMS_CAMERA_CACHE_TTL_MS`, default **60s**):

- Cacheia resultado **positivo e negativo** (uma câmera inexistente não martela o
  Firestore a cada segmento). O resultado **negativo** usa um TTL mais curto
  (≤10s) que o positivo: uma câmera recém-cadastrada/reativada aparece pelo proxy
  em segundos, não nos 60s inteiros.
- **Deduplica** leituras concorrentes do mesmo `cameraId` (in-flight) — evita
  "thundering herd" no cache miss quando muitos players abrem juntos.
- **Teto de entradas** (eviction das mais antigas + varredura de expiradas): o
  `cameraId` vem da rota pública, então o cache não cresce sem limite.
- A **listagem** (`/aerodromes/:icao/cameras`) **não** usa esse cache — lê sempre
  fresco, refletindo o cadastro atual.

## Configuração (env)

| Variável                                                                 | Default | Papel                                                 |
| ------------------------------------------------------------------------ | ------- | ----------------------------------------------------- |
| `FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` | —       | Credenciais do Firebase Admin (leitura do Firestore). |
| `STREAMS_CAMERA_CACHE_TTL_MS`                                            | `60000` | TTL do cache da config da câmera.                     |
| `STREAMS_PROXY_TIMEOUT_MS`                                               | `10000` | Timeout do `GET` ao mediamtx.                         |
| `STREAMS_MEDIAMTX_HLS_PORT`                                              | `8888`  | Porta do servidor HLS do mediamtx no Raspi.           |

A câmera vive no Firestore (collection `cameras`) com os campos
`{ icao, name, mediamtxNode, mediamtxPath, enabled }` (o repositório tolera tanto
camelCase quanto snake_case). O cadastro é gerido pelo frontend
([atzaero/aerobi#1008](https://github.com/atzaero/aerobi/issues/1008)).

## Como debugar

As rotas são **públicas** — sem header de autenticação.

```bash
# 1. Listar as câmeras de um aeródromo
curl -s http://localhost:3333/aerodromes/SBSP/cameras | jq

# 2. Baixar a playlist (deve vir Content-Type application/vnd.apple.mpegurl)
curl -i http://localhost:3333/streams/aero-mvp-cam-1/index.m3u8

# 3. Baixar um segmento referenciado pela playlist
curl -i http://localhost:3333/streams/aero-mvp-cam-1/seg7.m4s -o /dev/null

# Diagnóstico: 404 → câmera não existe/disabled, ou path offline no mediamtx.
#              502 → mediamtx fora do ar / timeout (cheque a tailnet e o Raspi).
```

Para isolar se o problema é o proxy ou o upstream, bata direto no mediamtx
(de uma máquina na tailnet): `curl -i http://<mediamtxNode>:8888/<mediamtxPath>/index.m3u8`.
Os logs do `HlsProxyService`/`CameraRepository` registram câmeras malformadas e
falhas de upstream (com a URL alvo).

## Estrutura

Segue o padrão do projeto (referência: `movements`): `controllers/`, `services/`,
`repositories/`, `dtos/`, `mappers/`, `docs/` (Swagger), `types/`, `utils/`.
O `CameraRepository` é o **único** ponto que conhece a collection/campos do
Firestore (isolamento espelhado no `FirestoreDirectoryAdapter` do `conformity`).

## Fora de escopo (follow-ups)

- **CRUD de câmeras** → frontend ([atzaero/aerobi#1008](https://github.com/atzaero/aerobi/issues/1008)), direto no Firestore.
- **WebRTC** (WHEP, <1s de latência) — P1.
- **Métricas Prometheus** do proxy — P2.

## Referências

- Épica: [#317](https://github.com/atzaero/aerobi-api/issues/317) · issues [#74](https://github.com/atzaero/aerobi-api/issues/74), [#75](https://github.com/atzaero/aerobi-api/issues/75), [#78](https://github.com/atzaero/aerobi-api/issues/78)
- Doc de arquitetura: [`ARQUITETURA_STREAMING.md`](https://github.com/atzaero/aerobi-poc/blob/main/ARQUITETURA_STREAMING.md)
- `FirestoreService` (`src/common/firestore/firestore.service.ts`), guard (`src/common/guards/aerobi-api-key.guard.ts`)
