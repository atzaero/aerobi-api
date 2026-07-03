import { MIME_TO_EXT } from '../utils/image-mimetype';

/**
 * Helpers **puros** de nome de arquivo/leaf no Storage. Portados do `aerobi-web`
 * (`src/lib/storage-filename.ts`) para manter a mesma convenção entre front e
 * API. Fonte única do "arquivo" da key (`{fileId}[-{slug}].{ext}`) — não
 * duplicar por módulo.
 */

/** Extensão (sem ponto, minúscula) de um nome de arquivo; `''` quando não há. */
export function extractExtension(filename: string): string {
  const base = filename.split('/').pop() ?? filename;
  const dot = base.lastIndexOf('.');
  if (dot <= 0 || dot === base.length - 1) return '';
  return base.slice(dot + 1).toLowerCase();
}

/**
 * Slug de um nome de arquivo: sem acentos, minúsculo, apenas `[a-z0-9.]`
 * (hífens colapsados); preserva a extensão (os pontos). Fallback `'arquivo'`.
 */
export function slugifyFilename(filename: string): string {
  const base = (filename.split('/').pop() ?? filename).trim().toLowerCase();
  const slug = base
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-.]+/, '')
    .replace(/-+$/, '');
  return slug || 'arquivo';
}

/**
 * Leaf `{uuid}.{ext}` para pastas de **arquivo único** (imagem do grupo, imagem
 * do aeródromo, imagem do movimento). Sem extensão → apenas `{uuid}`. O `uuid` é
 * injetado para determinismo/testabilidade.
 */
export function buildUuidLeaf(uuid: string, ext: string): string {
  const normalized = ext.trim().toLowerCase().replace(/^\.+/, '');
  return normalized ? `${uuid}.${normalized}` : uuid;
}

/**
 * Leaf `{uuid}-{slug(originalFilename)}` para pastas que aceitam **múltiplos**
 * arquivos (o uuid garante unicidade; o slug preserva nome/extensão reais). O
 * nome original completo deve ser persistido em coluna de metadado, não na key.
 */
export function buildUniqueLeaf(
  uuid: string,
  originalFilename: string,
): string {
  return `${uuid}-${slugifyFilename(originalFilename)}`;
}

/**
 * Extensão a usar na key: preferir a do nome original; senão a do mimetype de
 * imagem (`MIME_TO_EXT`); senão `'bin'`. Centraliza a lógica que estava
 * replicada em `buildReadingImageKey`/`buildGroupImageKey`.
 */
export function resolveKeyExtension(params: {
  originalFilename?: string;
  mimetype?: string;
}): string {
  const fromName = params.originalFilename
    ? extractExtension(params.originalFilename)
    : '';
  if (fromName) return fromName;
  if (params.mimetype) {
    const fromMime = MIME_TO_EXT[params.mimetype];
    if (fromMime) return fromMime;
  }
  return 'bin';
}
