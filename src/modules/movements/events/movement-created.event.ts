import type { MovementSource, MovementType } from '@/generated/prisma/enums';

/**
 * Nome do evento de domínio emitido após a criação de um movimento.
 * Listeners (snapshot/conformidade, notificações) são registrados em #252/#253.
 */
export const MOVEMENT_CREATED_EVENT = 'movement.created';

/**
 * Payload do evento `movement.created`. Carrega o identificador do movimento já
 * persistido e os campos mínimos para que listeners desacoplados reajam sem
 * precisar reconsultar o banco para o caso comum.
 */
export interface MovementCreatedEvent {
  movementId: string;
  registration: string;
  aerodrome: string | null;
  operationType: MovementType;
  source: MovementSource;
  readingDatetime: Date;
}
