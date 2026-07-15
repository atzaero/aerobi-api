import type { MovementCreatedEvent } from './movement-created.event';

/**
 * Nome do evento de domínio emitido após um lote de movimentos ser processado.
 * Carrega os movimentos efetivamente criados no lote para que o resumo agregado
 * por grupo de aeródromos seja despachado uma única vez por grupo (em vez de uma
 * notificação por movimento).
 */
export const MOVEMENTS_BATCH_CREATED_EVENT = 'movements.batch.created';

/**
 * Payload do evento `movements.batch.created`. `movements` traz o payload já
 * resolvido de cada movimento criado no lote (mesmo formato do evento avulso),
 * para o listener agrupar por aeródromo/grupo sem reconsultar o banco.
 */
export interface MovementsBatchCreatedEvent {
  movements: MovementCreatedEvent[];
}
