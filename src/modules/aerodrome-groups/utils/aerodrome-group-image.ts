import { randomUUID } from 'node:crypto';

/** Mapa de mimetypes de imagem aceitos → extensão usada na key. */
const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

/** Mimetypes de imagem aceitos no upload da imagem do grupo. */
export const ALLOWED_IMAGE_MIMETYPES = Object.keys(MIME_TO_EXT);

/**
 * Tamanho máximo da imagem (5 MB), espelhando o limite do `aerobi-web` para a
 * imagem do grupo (`movements` usa 10 MB; aqui é 5 por paridade com o web).
 */
export const MAX_GROUP_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

/** `true` se o mimetype é uma imagem aceita. */
export function isAllowedImageMimetype(mimetype: string): boolean {
  return mimetype in MIME_TO_EXT;
}

/**
 * Monta a key do objeto no MinIO no layout `groups/{groupId}/images/<uuid>.<ext>`,
 * particionando por grupo. A estratégia de nomenclatura vive no domínio, não no
 * storage genérico.
 */
export function buildAerodromeGroupImageKey(
  groupId: string,
  mimetype: string,
): string {
  const ext = MIME_TO_EXT[mimetype] ?? 'bin';
  return `groups/${groupId}/images/${randomUUID()}.${ext}`;
}
