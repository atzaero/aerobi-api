/**
 * Padrões e limites de validação dos campos de stream de uma câmera, alinhados
 * ao boundary anti-SSRF do proxy `streams`
 * (`src/modules/streams/repositories/camera.repository.ts`) — a fonte que virá a
 * consumir estes metadados (streams v2, #473). Recriados aqui para que o CRUD
 * valide na escrita o que o proxy exige na leitura, mantendo os nomes de campo
 * idênticos para o cutover.
 */

/**
 * `mediamtxNode`: hostname/IP da tailnet (ex.: `aerobi-edge-mvp`, `100.64.0.9`).
 * Só letras, dígitos, ponto e hífen — bloqueia `/`, `@`, `:`, `%` e afins,
 * impedindo injeção de autoridade/porta na URL do proxy.
 */
export const MEDIAMTX_NODE_PATTERN = /^[A-Za-z0-9.-]+$/;

/**
 * `mediamtxPath`: identificador do stream no mediamtx. Um único segmento de
 * `[A-Za-z0-9._-]` (sem barras) — espelha o schema do formulário do `aerobi-web`
 * (`camera-fields-schema.ts`).
 */
export const MEDIAMTX_PATH_PATTERN = /^[A-Za-z0-9._-]+$/;

/** ICAO alfanumérico de 4 caracteres (aceita `SJ4E` — issue #323). */
export const ICAO_PATTERN = /^[A-Za-z0-9]{4}$/;

/** Limites de `name` (paridade com o web: 2–80). */
export const CAMERA_NAME_MIN = 2;
export const CAMERA_NAME_MAX = 80;

/** Limite de `mediamtxNode`/`mediamtxPath` (issue #372, Bloco E). */
export const MEDIAMTX_FIELD_MAX = 120;
