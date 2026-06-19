import { ConformityStatus, MovementType } from '@/generated/prisma/enums';

/**
 * Estados que o fluxo de conformidade **resolve** após avaliar um movimento —
 * subconjunto de {@link ConformityStatus}. `PENDING`/`NOT_APPLICABLE` são
 * definidos na criação/edição, nunca por uma resolução; tipar assim impede que
 * uma resolução apague indevidamente o status para esses valores.
 */
export type ResolvedConformityStatus = Extract<
  ConformityStatus,
  'CONFORMANT' | 'NON_CONFORMANT'
>;

/**
 * Entrada mínima para classificar a aplicabilidade da regra de conformidade a um
 * movimento: o tipo de operação e o ICAO do aeródromo (que pode ser `null`).
 */
export interface ConformityApplicabilityInput {
  operationType: MovementType;
  aerodrome: string | null;
}

/**
 * Indica se a regra de conformidade (pedido de aterragem aprovado) se aplica ao
 * movimento. A regra cobre **pousos com aeródromo conhecido**, de qualquer
 * origem (AUTOMATIC ou MANUAL). Decolagens e pousos sem ICAO ficam de fora.
 *
 * Função pura — único ponto de verdade desta condição, compartilhada entre a
 * classificação inicial (criação) e o filtro do listener de conformidade.
 */
export function isConformityApplicable(
  input: ConformityApplicabilityInput,
): boolean {
  return (
    input.operationType === MovementType.LANDING && input.aerodrome != null
  );
}

/**
 * Resolve o status de conformidade **inicial** de um movimento no momento da
 * criação: `PENDING` quando a regra se aplica (a avaliação real é assíncrona),
 * senão `NOT_APPLICABLE`. Os estados `CONFORMANT`/`NON_CONFORMANT` só são
 * atingidos depois, pelo fluxo de conformidade.
 */
export function resolveInitialConformityStatus(
  input: ConformityApplicabilityInput,
): ConformityStatus {
  return isConformityApplicable(input)
    ? ConformityStatus.PENDING
    : ConformityStatus.NOT_APPLICABLE;
}
