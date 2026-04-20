import { ApiProperty } from '@nestjs/swagger';

/**
 * Resposta de item único do model OperationalAerodrome.
 *
 * TODO: espelhar campos do model conforme schema.prisma.
 */
export class OperationalAerodromeResponseDTO {
  @ApiProperty({ description: 'Identificador único' })
  id!: string;
}
