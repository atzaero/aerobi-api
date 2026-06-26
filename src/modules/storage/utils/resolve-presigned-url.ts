import { Logger } from '@nestjs/common';

import { getErrorMessage } from '@/common/utils/error.util';
import { StorageService } from '@/modules/storage/services/storage.service';

const logger = new Logger('PresignedUrl');

/**
 * Resolve a presigned URL de uma `key` como **best-effort**: uma falha ao
 * assinar (ex. MinIO indisponível) não derruba a consulta — retorna `null` (e
 * loga) em vez de propagar. Key vazia/`null` resolve para `null`. Fonte única
 * usada por todos os módulos que expõem imagens via presigned URL.
 */
export async function resolveBestEffortPresignedUrl(
  storage: StorageService,
  key: string | null,
): Promise<string | null> {
  if (!key) {
    return null;
  }
  try {
    return await storage.getPresignedUrl(key);
  } catch (err) {
    logger.warn(
      `Falha ao gerar presigned URL de ${key}: ${getErrorMessage(err)}`,
    );
    return null;
  }
}
