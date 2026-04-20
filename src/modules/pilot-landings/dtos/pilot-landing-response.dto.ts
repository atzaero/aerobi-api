import { ApiProperty } from '@nestjs/swagger';

/**
 * Resposta de item único do model PilotLanding.
 *
 * TODO: espelhar campos do model conforme schema.prisma.
 */
export class PilotLandingResponseDTO {
  @ApiProperty({ description: 'Identificador único' })
  id!: string;
}
