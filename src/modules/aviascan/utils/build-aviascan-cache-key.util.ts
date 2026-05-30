import type { AviascanReadingsQuery } from '../types/aviascan.types';

/** Prefixo das chaves de cache das leituras AviaScan. */
export const AVIASCAN_READINGS_CACHE_PREFIX = 'aviascan:readings';

/**
 * Constrói uma chave de cache estável a partir da query de leituras.
 *
 * Aplica os mesmos defaults do service (`page=1`, `limit=10`) para que chamadas
 * equivalentes — com e sem os parâmetros explícitos — compartilhem a mesma
 * entrada de cache. Filtros ausentes entram como string vazia, mantendo a
 * ordem fixa dos campos.
 */
export function buildAviascanReadingsCacheKey(
  query: AviascanReadingsQuery,
): string {
  const enc = (value: string | number | undefined): string =>
    encodeURIComponent(String(value ?? ''));
  const parts = [
    `page=${enc(query.page ?? 1)}`,
    `limit=${enc(query.limit ?? 10)}`,
    `registration=${enc(query.registration)}`,
    `aerodrome=${enc(query.aerodrome)}`,
    `start_date=${enc(query.start_date)}`,
    `end_date=${enc(query.end_date)}`,
  ];
  return `${AVIASCAN_READINGS_CACHE_PREFIX}:${parts.join('|')}`;
}
