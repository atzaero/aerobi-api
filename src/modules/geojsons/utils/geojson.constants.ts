/**
 * Limite do GeoJSON inline no `jsonb` (paridade com o `aerobi-web`:
 * `MAX_GEOJSON_INLINE_UTF8_BYTES = 900 KiB` UTF-8). Acima do limite a geração
 * marca `status = ERROR` e zera o conteúdo (sem offload por ora — ver #376).
 */
export const MAX_GEOJSON_INLINE_UTF8_BYTES = 900 * 1024;

/**
 * Teto do arquivo-fonte KML/KMZ aceito pelo endpoint de (re)geração. O derivado
 * é limitado por `MAX_GEOJSON_INLINE_UTF8_BYTES`; um KMZ compactado pode ser
 * maior que isso, então o teto de origem é mais folgado.
 */
export const MAX_GEOJSON_SOURCE_SIZE_BYTES = 20 * 1024 * 1024;
