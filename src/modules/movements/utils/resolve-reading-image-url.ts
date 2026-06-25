import { Logger } from '@nestjs/common';

import { getErrorMessage } from '@/common/utils/error.util';
import { StorageService } from '@/modules/storage/services/storage.service';

const logger = new Logger('ReadingImageUrl');

/**
 * Resolve a presigned URL de uma key como **best-effort**: uma falha ao assinar
 * (ex. MinIO indisponível) não deve derrubar uma consulta. Retorna `null` (e
 * loga) em vez de propagar. Itens sem `imageKey` resolvem para `null`.
 */
export async function resolveReadingImageUrl(
  storage: StorageService,
  imageKey: string | null,
): Promise<string | null> {
  if (!imageKey) {
    return null;
  }
  try {
    return await storage.getPresignedUrl(imageKey);
  } catch (err) {
    const msg = getErrorMessage(err);
    logger.warn(`Falha ao gerar presigned URL de ${imageKey}: ${msg}`);
    return null;
  }
}
