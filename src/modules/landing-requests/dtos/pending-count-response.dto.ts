import { ApiProperty } from '@nestjs/swagger';

/**
 * Resposta do `GET /landing-requests/pending-count` — contagem de solicitações
 * pendentes no escopo do ator (substitui o `watch-pending` em tempo real do web
 * por polling; SSE fica como follow-up).
 */
export class PendingCountResponseDTO {
  @ApiProperty({
    example: 3,
    description: 'Solicitações pendentes no escopo do ator',
  })
  count!: number;
}
