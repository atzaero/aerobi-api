import { randomUUID } from 'node:crypto';

/** Mapa de mimetypes de imagem aceitos → extensão usada na key. */
const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

/** Mimetypes de imagem aceitos no upload de leituras. */
export const ALLOWED_IMAGE_MIMETYPES = Object.keys(MIME_TO_EXT);

/** Tamanho máximo da imagem (10 MB), espelhando o limite do aviascan-api legado. */
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

/** Máximo de imagens por requisição de lote (`POST /readings/batch`). */
export const MAX_BATCH_FILES = 50;

/** `true` se o mimetype é uma imagem aceita. */
export function isAllowedImageMimetype(mimetype: string): boolean {
  return mimetype in MIME_TO_EXT;
}

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
