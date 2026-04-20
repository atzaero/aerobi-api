import { ApiProperty } from '@nestjs/swagger';

/**
 * Resposta de item único do model AerodromeGroup.
 *
 * TODO: espelhar campos do model conforme schema.prisma.
 */
export class AerodromeGroupResponseDTO {
  @ApiProperty({ description: 'Identificador único' })
  id!: string;
}
