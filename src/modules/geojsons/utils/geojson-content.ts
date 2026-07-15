import { createHash } from 'node:crypto';

import type { ConvertedAerodromeSource } from './convert-aerodrome-source';
import { MAX_GEOJSON_INLINE_UTF8_BYTES } from './geojson.constants';

/**
 * Validação **leve** de GeoJSON (é objeto, não array/escalar) — espelha
 * `isGeoJsonObject` do web. Não valida geometria RFC 7946 por completo (custo em
 * payloads grandes; ver decisão nº 8 da #376).
 */
export function isGeoJsonObject(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Aceita um GeoJSON persistido como **objeto** (jsonb — caso canônico da API) ou
 * como **string JSON** (tolerância a dados de backfill do Firestore). Devolve o
 * objeto validado ou `null` quando ausente/ilegível. Espelha `parseGeoJsonField`
 * do web.
 */
export function parseGeoJsonField(
  raw: unknown,
): Record<string, unknown> | null {
  if (typeof raw === 'string') {
    try {
      const parsed: unknown = JSON.parse(raw);
      return isGeoJsonObject(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }
  return isGeoJsonObject(raw) ? raw : null;
}

/** Conteúdo READY: payload inline + métricas de conversão + hash de versão. */
export interface GeojsonReadyContent {
  status: 'READY';
  geoJson: Record<string, unknown>;
  geoJsonBytes: number;
  featureCount: number;
  sourceBytes: number;
  kmlTextBytes: number;
  zipBytes: number | null;
  versionHash: string;
  errorMessage: null;
}

/** Conteúdo ERROR: payload zerado + mensagem (espelha `buildGeojsonErrorFields`). */
export interface GeojsonErrorContent {
  status: 'ERROR';
  geoJson: null;
  geoJsonBytes: 0;
  featureCount: 0;
  errorMessage: string;
}

export type GeojsonContentDecision = GeojsonReadyContent | GeojsonErrorContent;

/** Monta o conteúdo de erro (payload zerado). */
export function buildGeojsonErrorContent(message: string): GeojsonErrorContent {
  return {
    status: 'ERROR',
    geoJson: null,
    geoJsonBytes: 0,
    featureCount: 0,
    errorMessage: message,
  };
}

/**
 * Decide o conteúdo persistido a partir da conversão: acima do limite inline
 * (`>` estrito, como no web) vira `ERROR` com payload zerado; caso contrário
 * `READY` com o objeto, métricas e `versionHash` (sha256 do JSON serializado).
 * Porte de `decideGeojsonContent`.
 */
export function decideGeojsonContent(
  converted: ConvertedAerodromeSource,
  limitBytes: number = MAX_GEOJSON_INLINE_UTF8_BYTES,
): GeojsonContentDecision {
  if (converted.geoJsonBytes > limitBytes) {
    return buildGeojsonErrorContent(
      `GeoJSON excede o limite inline de ${limitBytes} bytes (atual: ${converted.geoJsonBytes})`,
    );
  }

  return {
    status: 'READY',
    geoJson: converted.geoJson,
    geoJsonBytes: converted.geoJsonBytes,
    featureCount: converted.featureCount,
    sourceBytes: converted.sourceBytes,
    kmlTextBytes: converted.kmlTextBytes,
    zipBytes: converted.zipBytes,
    versionHash: createHash('sha256')
      .update(converted.geoJsonRaw)
      .digest('hex'),
    errorMessage: null,
  };
}
