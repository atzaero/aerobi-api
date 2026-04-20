import { ApiProperty } from '@nestjs/swagger';

/**
 * Resposta de item único do model TechnicalVisit.
 *
 * TODO: espelhar campos do model conforme schema.prisma.
 */
export class TechnicalVisitResponseDTO {
  @ApiProperty({ description: 'Identificador único' })
  id!: string;
}
