import type { ResolvedConformityStatus } from '../utils/conformity-status.util';

/**
 * Nome do evento de domínio emitido pelo fluxo de conformidade quando a
 * conformidade de um movimento é decidida (`CONFORMANT`/`NON_CONFORMANT`).
 *
 * Desacopla a **decisão** (módulo `conformity`) da **persistência** do status na
 * coluna `conformity_status` (módulo `movements`), que reage a este evento sem
 * que o `conformity` precise conhecer o repositório de movimentos.
 */
export const MOVEMENT_CONFORMITY_RESOLVED_EVENT =
  'movement.conformity_resolved';

/**
 * Payload do evento `movement.conformity_resolved`: o movimento avaliado e o
 * status resolvido a persistir (apenas `CONFORMANT`/`NON_CONFORMANT`).
 */
export interface MovementConformityResolvedEvent {
  movementId: string;
  status: ResolvedConformityStatus;
}
