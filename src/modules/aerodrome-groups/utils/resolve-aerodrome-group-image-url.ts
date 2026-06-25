import { Logger } from '@nestjs/common';

import { StorageService } from '@/modules/storage/services/storage.service';

const logger = new Logger('AerodromeGroupImageUrl');

/**
 * Resolve a presigned URL de uma key como **best-effort**: uma falha ao assinar
 * (ex. MinIO indisponível) não deve derrubar uma consulta. Retorna `null` (e
 * loga) em vez de propagar. Grupos sem `imageKey` resolvem para `null`.
 */
export async function resolveAerodromeGroupImageUrl(
  storage: StorageService,
  imageKey: string | null,
): Promise<string | null> {
  if (!imageKey) {
    return null;
  }
  try {
    return await storage.getPresignedUrl(imageKey);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.warn(`Falha ao gerar presigned URL de ${imageKey}: ${msg}`);
    return null;
  }
}
