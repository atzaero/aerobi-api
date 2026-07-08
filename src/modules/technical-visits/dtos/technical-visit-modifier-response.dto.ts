import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { TECHNICAL_VISIT_EXAMPLE_ACTOR_ID } from '../docs/technical-visit.examples';

/** Modificador da visita (trilha de quem cadastrou/editou) — paridade web. */
export class TechnicalVisitModifierResponseDTO {
  @ApiProperty({ example: 'Admin Aerobi' })
  name!: string;

  @ApiProperty({ example: 'admin@aerobi.com.br' })
  email!: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    example: '2024-06-01T09:00:00.000Z',
  })
  date!: string | null;

  @ApiPropertyOptional({
    type: String,
    format: 'uuid',
    example: TECHNICAL_VISIT_EXAMPLE_ACTOR_ID,
  })
  userId!: string | null;
}
