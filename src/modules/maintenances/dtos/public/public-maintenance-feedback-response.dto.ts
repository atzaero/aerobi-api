import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { PublicTaskGuessResponseDTO } from '@/modules/guesses/dtos/guess.dto';
import { TaskResponseDTO } from '@/modules/tasks/dtos/task.dto';

/**
 * Cabeçalho do aeródromo na tela pública de palpites.
 */
export class PublicAerodromeHeaderDTO {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  icao!: string;

  @ApiPropertyOptional({ nullable: true, example: 'PI' })
  uf!: string | null;
}

/**
 * Metadados públicos da intervenção (sem código nem lista de e-mails).
 */
export class PublicMaintenanceMetaDTO {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  authorizedEmailsCount!: number;

  @ApiProperty()
  publicAccessEnabled!: boolean;
}

/**
 * Payload de `GET /public/maintenances/:id/feedback`.
 */
export class PublicMaintenanceFeedbackResponseDTO {
  @ApiProperty({ type: PublicAerodromeHeaderDTO })
  aerodrome!: PublicAerodromeHeaderDTO;

  @ApiPropertyOptional({ type: PublicMaintenanceMetaDTO, nullable: true })
  maintenance!: PublicMaintenanceMetaDTO | null;

  @ApiPropertyOptional({ nullable: true })
  unavailableMessage!: string | null;

  @ApiProperty({ type: [TaskResponseDTO] })
  tasks!: TaskResponseDTO[];

  @ApiProperty({
    type: 'object',
    additionalProperties: {
      type: 'array',
      items: { $ref: '#/components/schemas/PublicTaskGuessResponseDTO' },
    },
  })
  guessesByTaskId!: Record<string, PublicTaskGuessResponseDTO[]>;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Null quando o e-mail não foi informado na query.',
  })
  emailAuthorized!: boolean | null;

  @ApiProperty()
  canSubmitGuess!: boolean;
}
