import { StorageDomain } from './storage-domain.enum';

/**
 * Vocabulário estável de `docType` (o "tipo de arquivo" — 3º segmento da key)
 * por domínio. Fonte única: os módulos consomem daqui em vez de espalhar
 * literais soltos. Convenção **snake_case** (alinhada aos dados atuais no
 * storage e aos enums do `schema.prisma`).
 *
 * Para `technical-visits` o `docType` é a **seção de inspeção** e espelha o enum
 * Prisma `TechnicalVisitImageSection` (#369) — manter em sincronia ao migrar
 * aquele módulo. `landings`/`aerodromes` cobrem o vocabulário previsto pelas
 * migrações #430/#369; estender aqui (e não por módulo) quando surgir novo tipo.
 */
export const STORAGE_DOC_TYPES = {
  [StorageDomain.USERS]: ['avatar', 'identity_document'],
  [StorageDomain.GROUPS]: ['images'],
  [StorageDomain.AERODROMES]: [
    'image',
    'kml',
    'plan_ordinance',
    'registration_ordinance',
    'grant_term',
    'aeronautical_study',
    'other_ordinance',
    'extra',
  ],
  [StorageDomain.TECHNICAL_VISITS]: [
    'gates_padlocks',
    'fence',
    'standard_plate',
    'quality',
    'horizontal_signage',
    'unobstructed_headboards',
    'track_range',
    'trash_debris',
    'delimited_perimeter',
    'extra',
  ],
  [StorageDomain.MOVEMENTS]: ['image'],
  [StorageDomain.LANDINGS]: ['image'],
} as const satisfies Record<StorageDomain, readonly string[]>;

/** Union dos `docType` válidos para um domínio. */
export type StorageDocType<D extends StorageDomain> =
  (typeof STORAGE_DOC_TYPES)[D][number];

/** `true` se `docType` pertence ao vocabulário do `domain`. */
export function isValidDocType(
  domain: StorageDomain,
  docType: string,
): boolean {
  return (STORAGE_DOC_TYPES[domain] as readonly string[]).includes(docType);
}
