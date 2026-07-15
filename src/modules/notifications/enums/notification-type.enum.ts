/**
 * Tipos de notificação suportados pelo dispatch.
 *
 * Cada tipo tem um {@link NotificationMessageBuilder} que sabe renderizar o
 * texto a partir dos `params` específicos. Adicionar um novo tipo de mensagem =
 * adicionar um valor aqui + um builder registrado no módulo.
 */
export enum NotificationType {
  /** Um movimento (pouso/decolagem) avulso foi criado. */
  MOVEMENT_CREATED = 'movement.created',
  /** Resumo agregado de um lote de movimentos para um grupo de aeródromos. */
  MOVEMENTS_BATCH_SUMMARY = 'movements.batch.summary',
}
