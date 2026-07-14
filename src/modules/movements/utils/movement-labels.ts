import {
  ConformityStatus,
  MovementSource,
  MovementType,
} from '@/generated/prisma/enums';

/**
 * Rótulos pt-BR dos enums de movimento — fonte única para o export CSV,
 * espelhando os formatadores da UI (`aerobi-web/src/lib/movement.ts`) para
 * paridade do texto. Valor ausente/desconhecido cai em string vazia no CSV.
 */
const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
  [MovementType.LANDING]: 'Pouso',
  [MovementType.TAKEOFF]: 'Decolagem',
};

const MOVEMENT_SOURCE_LABELS: Record<MovementSource, string> = {
  [MovementSource.AUTOMATIC]: 'Automático',
  [MovementSource.MANUAL]: 'Manual',
};

const CONFORMITY_STATUS_LABELS: Record<ConformityStatus, string> = {
  [ConformityStatus.PENDING]: 'Pendente',
  [ConformityStatus.CONFORMANT]: 'Conforme',
  [ConformityStatus.NON_CONFORMANT]: 'Não conforme',
  [ConformityStatus.NOT_APPLICABLE]: 'Não aplicável',
};

/** Rótulo pt-BR do tipo de operação (pouso/decolagem). */
export function formatMovementType(value: MovementType | null): string {
  return value ? (MOVEMENT_TYPE_LABELS[value] ?? '') : '';
}

/** Rótulo pt-BR da origem do movimento (automático/manual). */
export function formatMovementSource(value: MovementSource | null): string {
  return value ? (MOVEMENT_SOURCE_LABELS[value] ?? '') : '';
}

/** Rótulo pt-BR da conformidade do movimento. */
export function formatConformityStatus(value: ConformityStatus | null): string {
  return value ? (CONFORMITY_STATUS_LABELS[value] ?? '') : '';
}
