/** Nome do evento (usado por `@OnEvent`). */
export const MAINTENANCE_INVITED_EVENT = 'maintenance.invited';

/**
 * Payload emitido após criar/editar intervenção quando há destinatários de
 * convite. O listener envia os e-mails de forma best-effort.
 */
export class MaintenanceInvitedEvent {
  constructor(
    public readonly maintenanceId: string,
    public readonly aerodromeId: string,
    public readonly emails: readonly string[],
    public readonly securityCode: string,
  ) {}
}
