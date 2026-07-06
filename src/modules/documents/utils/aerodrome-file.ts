import { DocumentType } from '@/generated/prisma/client';

/**
 * Validação do arquivo do `upload-aerodrome-file` (restrito a `kml`/`image`) —
 * porte de `aerobi-web/src/lib/aerodrome-file.ts`. Mais rígida que o `POST
 * /documents` genérico (que aceita qualquer mimetype).
 */

export const MAX_AERODROME_FILE_BYTES = 10 * 1024 * 1024;

/** Imagem: valida por MIME oficial. */
export const ALLOWED_AERODROME_IMAGE_MIME = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

/** KML/KMZ: MIMEs oficiais (aceita também por extensão — MIME costuma vir vazio). */
export const ALLOWED_KML_MIME = [
  'application/vnd.google-earth.kml+xml',
  'application/vnd.google-earth.kmz',
] as const;

export const KML_EXTENSIONS = ['.kml', '.kmz'] as const;

/** Termina em `.kml`/`.kmz` (case-insensitive). */
export function hasKmlExtension(filename: string): boolean {
  const lower = filename.toLowerCase();
  return KML_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

/**
 * `true` se o arquivo é aceito para o tipo. `IMAGE` só por MIME
 * (jpeg/png/webp); `KML` por MIME oficial **ou** extensão `.kml`/`.kmz`.
 */
export function isAllowedAerodromeFile(
  type: DocumentType,
  file: Express.Multer.File,
): boolean {
  if (type === DocumentType.IMAGE) {
    return (ALLOWED_AERODROME_IMAGE_MIME as readonly string[]).includes(
      file.mimetype,
    );
  }
  return (
    (ALLOWED_KML_MIME as readonly string[]).includes(file.mimetype) ||
    hasKmlExtension(file.originalname ?? '')
  );
}
