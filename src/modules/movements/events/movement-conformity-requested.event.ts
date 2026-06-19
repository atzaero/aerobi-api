import type { MovementCreatedEvent } from './movement-created.event';

/**
 * Nome do evento de domínio que **pede a reavaliação** da conformidade de um
 * movimento já existente, sem ser uma nova criação. Emitido, por exemplo, quando
 * a matrícula é corrigida (a decisão de conformidade calculada para a matrícula
 * anterior fica obsoleta).
 *
 * Diferente de `movement.created`, este evento dispara **apenas** o listener de
 * conformidade — não as notificações de criação. Reaproveita o payload de
 * {@link MovementCreatedEvent} por carregar exatamente os mesmos campos.
 */
export const MOVEMENT_CONFORMITY_REQUESTED_EVENT =
  'movement.conformity_requested';

/**
 * Payload de `movement.conformity_requested` (idêntico ao de criação). Reusa
 * {@link MovementCreatedEvent} para evitar duplicar a forma; o campo `batched`
 * herdado é irrelevante aqui (a reavaliação não passa por lote) e é ignorado
 * pelo `ConformityListener`.
 */
export type MovementConformityRequestedEvent = MovementCreatedEvent;
