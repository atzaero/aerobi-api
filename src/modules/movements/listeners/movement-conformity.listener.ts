import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import {
  MOVEMENT_CONFORMITY_RESOLVED_EVENT,
  type MovementConformityResolvedEvent,
} from '../events/movement-conformity-resolved.event';
import { MovementRepository } from '../repositories/movement.repository';

/**
 * Persiste, na coluna `conformity_status` do movimento, o status decidido pelo
 * fluxo de conformidade (módulo `conformity`), que reage emitindo
 * {@link MOVEMENT_CONFORMITY_RESOLVED_EVENT}.
 *
 * Responsabilidade única (apenas a escrita do status): a **decisão** vive no
 * `conformity`; este listener mantém o módulo `movements` como dono da sua
 * coluna, sem que o `conformity` precise conhecer o repositório. Best-effort:
 * falhas são logadas e não relançadas (handler assíncrono e desacoplado).
 */
@Injectable()
export class MovementConformityListener {
  private readonly logger = new Logger(MovementConformityListener.name);

  constructor(private readonly repo: MovementRepository) {}

  @OnEvent(MOVEMENT_CONFORMITY_RESOLVED_EVENT)
  async handleConformityResolved(
    event: MovementConformityResolvedEvent,
  ): Promise<void> {
    try {
      await this.repo.updateConformityStatus(event.movementId, event.status);
    } catch (err) {
      this.logger.error(
        `Falha ao persistir conformidade do movimento ${event.movementId}: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }
}
