import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { GUESS_STATUSES } from '../mappers/maintenance-guess.prisma.mapper';

/**
 * Body para `PATCH /guesses/:id/status`.
 */
export class UpdateGuessStatusDTO {
  @ApiProperty({ enum: GUESS_STATUSES })
  @IsEnum(GUESS_STATUSES)
  status!: (typeof GUESS_STATUSES)[number];
}
