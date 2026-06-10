/**
 * Nome do evento de domínio emitido quando um pouso automático sem solicitação
 * de aterragem aprovada gera uma não-conformidade (`OperationalEvent`).
 *
 * O consumidor que dispara a notificação por e-mail é registrado em #253; este
 * evento desacopla a deteção (#252) do envio.
 */
export const MOVEMENT_NON_CONFORMITY_EVENT = 'movement.non_conformity';

/**
 * Payload do evento `movement.non_conformity`. Carrega o `OperationalEvent` já
 * persistido e os campos mínimos para a notificação reagir sem reconsultar o
 * banco no caso comum.
 */
export interface MovementNonConformityEvent {
  operationalEventId: string;
  movementId: string;
  registration: string;
  aerodrome: string;
  occurredAt: Date;
}
