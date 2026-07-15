import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

import { GUESS_STATUSES } from '../mappers/maintenance-guess.prisma.mapper';

/**
 * Body para `PATCH /guesses/:id/status`.
 */
export class UpdateGuessStatusDTO {
  @ApiProperty({ enum: GUESS_STATUSES })
  @IsIn(GUESS_STATUSES)
  status!: (typeof GUESS_STATUSES)[number];
}
