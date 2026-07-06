import { ApiProperty } from '@nestjs/swagger';

import { GUESS_STATUSES } from '../mappers/maintenance-guess.prisma.mapper';

/**
 * Palpite/sugestão pública (sem id) exibido na view de feedback.
 */
export class PublicTaskGuessResponseDTO {
  @ApiProperty()
  text!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ enum: GUESS_STATUSES })
  status!: (typeof GUESS_STATUSES)[number];

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;
}

/**
 * Palpite listado na moderação interna (com id).
 */
export class GuessListItemResponseDTO extends PublicTaskGuessResponseDTO {
  @ApiProperty({ format: 'uuid' })
  id!: string;
}

/**
 * Resposta da atualização de status de um palpite.
 */
export class UpdateGuessStatusResponseDTO {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ enum: GUESS_STATUSES })
  status!: (typeof GUESS_STATUSES)[number];

  @ApiProperty({ format: 'uuid' })
  maintenanceId!: string;
}

/**
 * Resposta do soft-delete de um palpite.
 */
export class RemoveGuessResponseDTO {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  maintenanceId!: string;
}
