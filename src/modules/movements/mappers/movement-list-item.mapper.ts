import type { Movement } from '@/generated/prisma/client';

import { MovementListItemDTO } from '../dtos/movement-list-item.dto';

/**
 * Projeta a entidade `Movement` no item enxuto da lista (camelCase). Dedicado à
 * lista (`GET /movements`) — o detalhe usa o `MovementMapper`. A `imageUrl`
 * (presigned) é resolvida no service e injetada aqui, mantendo o mapper
 * síncrono/testável. Não lê o `aircraftSnapshot`, portanto aceita um `Movement`
 * simples (sem `include`).
 */
export class MovementListItemMapper {
  static toListItem(
    entity: Movement,
    imageUrl: string | null,
  ): MovementListItemDTO {
    const row = new MovementListItemDTO();
    row.id = entity.id;
    row.registration = entity.registration;
    row.aerodrome = entity.aerodrome;
    row.readingDatetime = entity.readingDatetime.toISOString();
    row.imageUrl = imageUrl;
    row.operationType = entity.operationType;
    row.source = entity.source;
    return row;
  }
}
