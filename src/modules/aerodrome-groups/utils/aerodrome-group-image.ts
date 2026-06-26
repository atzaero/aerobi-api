import { randomUUID } from 'node:crypto';

import { MIME_TO_EXT } from '@/modules/storage/utils/image-mimetype';

export {
  ALLOWED_IMAGE_MIMETYPES,
  isAllowedImageMimetype,
} from '@/modules/storage/utils/image-mimetype';

/**
 * Tamanho máximo da imagem (5 MB), espelhando o limite do `aerobi-web` para a
 * imagem do grupo (`movements` usa 10 MB; aqui é 5 por paridade com o web).
 */
export const MAX_GROUP_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

/** Assinatura de magic bytes do JPEG: `FF D8 FF`. */
function matchesJpeg(buffer: Buffer): boolean {
  return (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  );
}

/** Assinatura de magic bytes do PNG: `89 50 4E 47 0D 0A 1A 0A`. */
function matchesPng(buffer: Buffer): boolean {
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  return (
    buffer.length >= signature.length &&
    signature.every((byte, index) => buffer[index] === byte)
  );
}

/** Contêiner WebP: `RIFF` (bytes 0-3) + `WEBP` (bytes 8-11). */
function matchesWebp(buffer: Buffer): boolean {
  return (
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  );
}

/**
 * Detecta o mimetype real de `buffer` pelas magic bytes, restrito às imagens
 * aceitas. Retorna `null` quando o conteúdo não corresponde a nenhuma (bytes
 * arbitrários, polyglot, arquivo vazio ou formato não suportado). Cruzar este
 * resultado com o mimetype declarado fecha o vetor de header multipart forjado,
 * já que o `mimetype` do Multer vem do `Content-Type` enviado pelo cliente.
 */
export function detectImageMimetype(buffer: Buffer | undefined): string | null {
  if (!buffer || buffer.length === 0) return null;
  if (matchesJpeg(buffer)) return 'image/jpeg';
  if (matchesPng(buffer)) return 'image/png';
  if (matchesWebp(buffer)) return 'image/webp';
  return null;
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
