/**
 * Normaliza um código ICAO (trim + maiúsculas). Espelha `normalizeIcao` do
 * `aerobi-web` (`src/features/domain/geojson/icao.ts`).
 */
export function normalizeIcao(icao: string): string {
  return icao.trim().toUpperCase();
}
