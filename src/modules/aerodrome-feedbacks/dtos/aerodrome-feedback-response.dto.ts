import { ApiProperty } from '@nestjs/swagger';

/**
 * Resposta de item único do model AerodromeFeedback.
 *
 * TODO: espelhar campos do model conforme schema.prisma.
 */
export class AerodromeFeedbackResponseDTO {
  @ApiProperty({ description: 'Identificador único' })
  id!: string;
}
