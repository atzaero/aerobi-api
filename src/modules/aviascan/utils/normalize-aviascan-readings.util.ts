import type {
  AviascanReading,
  AviascanReadingsPaginatedResponse,
} from '../types/aviascan.types';
import { resolveAviascanImageUrl } from './resolve-aviascan-image-url.util';

/**
 * Type guard para o envelope esperado do upstream AviaScan
 * (`{ data: [], meta: {} }`). Validação pura — o lançamento da exceção fica
 * a cargo do service (que tem acesso ao `ErrorMessageService`).
 */
export function isAviascanReadingsEnvelope(
  raw: unknown,
): raw is AviascanReadingsPaginatedResponse {
  return (
    raw !== null &&
    typeof raw === 'object' &&
    Array.isArray((raw as { data?: unknown }).data) &&
    typeof (raw as { meta?: unknown }).meta === 'object' &&
    (raw as { meta?: unknown }).meta !== null
  );
}

/**
 * Completa o `image_path` de cada leitura numa URL absoluta (ver
 * {@link resolveAviascanImageUrl}). A `meta` é encaminhada tal como recebida.
 *
 * @param envelope - Envelope já validado do upstream.
 * @param baseUrl - Base URL da AviaScan, usada para completar `image_path`.
 */
export function mapAviascanReadings(
  envelope: AviascanReadingsPaginatedResponse,
  baseUrl: string,
): AviascanReadingsPaginatedResponse {
  return {
    data: envelope.data.map((reading: AviascanReading) => ({
      ...reading,
      image_path: resolveAviascanImageUrl(reading.image_path, baseUrl) ?? null,
    })),
    meta: envelope.meta,
  };
}
