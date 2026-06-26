/**
 * Mapa de mimetypes de imagem aceitos → extensão usada na key do objeto. Fonte
 * única (allowlist de segurança): `Readonly` impede mutação acidental por um
 * consumidor.
 */
export const MIME_TO_EXT: Readonly<Record<string, string>> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

/** Mimetypes de imagem aceitos no upload ao storage. */
export const ALLOWED_IMAGE_MIMETYPES = Object.keys(MIME_TO_EXT);

/** `true` se o mimetype é uma imagem aceita. */
export function isAllowedImageMimetype(mimetype: string): boolean {
  return mimetype in MIME_TO_EXT;
}
