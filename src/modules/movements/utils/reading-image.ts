import { randomUUID } from 'node:crypto';

import { MIME_TO_EXT } from '@/modules/storage/utils/image-mimetype';

export {
  ALLOWED_IMAGE_MIMETYPES,
  isAllowedImageMimetype,
} from '@/modules/storage/utils/image-mimetype';

/** Tamanho máximo da imagem (10 MB), espelhando o limite do aviascan-api legado. */
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

/** Máximo de imagens por requisição de lote (`POST /readings/batch`). */
export const MAX_BATCH_FILES = 50;

/**
 * Monta a key do objeto no MinIO no layout `readings/YYYY/MM/<uuid>.<ext>`,
 * particionando por ano/mês da leitura. A estratégia de nomenclatura vive aqui
 * (domínio), não no storage genérico.
 */
export function buildReadingImageKey(
  mimetype: string,
  readingDatetime: Date,
): string {
  const ext = MIME_TO_EXT[mimetype] ?? 'bin';
  const year = readingDatetime.getUTCFullYear();
  const month = String(readingDatetime.getUTCMonth() + 1).padStart(2, '0');
  return `readings/${year}/${month}/${randomUUID()}.${ext}`;
}
