import * as toGeoJSON from '@tmcw/togeojson';
import { DOMParser } from '@xmldom/xmldom';
import JSZip from 'jszip';

import { GeojsonMapFileType } from '@/generated/prisma/client';

/**
 * Conversão KML/KMZ → GeoJSON (server-side). Porte de
 * `aerobi-web/src/features/domain/geojson/convert-aerodrome-source.ts` para a
 * API, com uma diferença: aqui o GeoJSON é mantido como **objeto** (vai para o
 * `jsonb`), enquanto o web serializava para string por limite do Firestore. Os
 * bytes (`geoJsonBytes`) continuam medidos sobre o JSON serializado em UTF-8,
 * por paridade com o limite inline.
 */

const textEncoder = new TextEncoder();

/** Sniff de ZIP/KMZ pelo magic-number `PK\x03\x04` (independe da extensão). */
function looksLikeZip(buffer: Buffer): boolean {
  return (
    buffer.length >= 4 &&
    buffer[0] === 0x50 &&
    buffer[1] === 0x4b &&
    buffer[2] === 0x03 &&
    buffer[3] === 0x04
  );
}

/**
 * Deriva o tipo de arquivo a partir do nome (default `KML`). `.kmz` → `KMZ`.
 * Espelha `deriveMapFileType` do web.
 */
export function deriveMapFileType(filename: string): GeojsonMapFileType {
  return filename.toLowerCase().endsWith('.kmz')
    ? GeojsonMapFileType.KMZ
    : GeojsonMapFileType.KML;
}

/**
 * Resultado da conversão. `geoJson` é o objeto (FeatureCollection); `geoJsonRaw`
 * é o serializado usado para medir bytes e derivar o `versionHash`.
 */
export interface ConvertedAerodromeSource {
  geoJson: Record<string, unknown>;
  geoJsonRaw: string;
  geoJsonBytes: number;
  featureCount: number;
  sourceBytes: number;
  kmlTextBytes: number;
  zipBytes: number | null;
}

/**
 * Extrai o texto KML da origem. Se for KMZ (declarado ou detectado pelo
 * magic-number), descompacta e usa o primeiro `.kml` interno.
 */
async function sourceToKmlText(
  fileType: GeojsonMapFileType,
  sourceBuffer: Buffer,
): Promise<{ kmlText: string; zipBytes: number | null }> {
  const isKmz =
    fileType === GeojsonMapFileType.KMZ || looksLikeZip(sourceBuffer);
  if (!isKmz) {
    return { kmlText: sourceBuffer.toString('utf-8'), zipBytes: null };
  }

  const zipBytes = sourceBuffer.byteLength;
  const zip = await JSZip.loadAsync(sourceBuffer);
  const kmlName = Object.keys(zip.files).find((name) =>
    name.toLowerCase().endsWith('.kml'),
  );
  const entry = kmlName ? zip.file(kmlName) : null;
  if (!entry) {
    throw new Error('KMZ sem arquivo .kml interno');
  }
  const kmlText = await entry.async('text');
  return { kmlText, zipBytes };
}

/** Converte o texto KML em objeto GeoJSON via `@xmldom/xmldom` + `@tmcw/togeojson`. */
function kmlToGeoJson(kmlText: string): Record<string, unknown> {
  const doc = new DOMParser().parseFromString(kmlText, 'text/xml');
  return toGeoJSON.kml(doc) as unknown as Record<string, unknown>;
}

/**
 * Pipeline completo: origem → KML → GeoJSON, com métricas (bytes UTF-8,
 * `featureCount`). Lança em erros de descompactação/parse — o chamador
 * (`GenerateGeojsonService`) trata como `status = ERROR` (best-effort).
 */
export async function convertAerodromeSource(
  fileType: GeojsonMapFileType,
  sourceBuffer: Buffer,
): Promise<ConvertedAerodromeSource> {
  const sourceBytes = sourceBuffer.byteLength;
  const { kmlText, zipBytes } = await sourceToKmlText(fileType, sourceBuffer);
  const geoJson = kmlToGeoJson(kmlText);
  const geoJsonRaw = JSON.stringify(geoJson);
  const geoJsonBytes = textEncoder.encode(geoJsonRaw).length;
  const features = (geoJson as { features?: unknown }).features;
  const featureCount = Array.isArray(features) ? features.length : 0;
  const kmlTextBytes = textEncoder.encode(kmlText).length;

  return {
    geoJson,
    geoJsonRaw,
    geoJsonBytes,
    featureCount,
    sourceBytes,
    kmlTextBytes,
    zipBytes,
  };
}
