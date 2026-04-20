import { ApiProperty } from '@nestjs/swagger';

/**
 * Resposta de item único do model AerodromeGeojson.
 *
 * TODO: espelhar campos do model conforme schema.prisma.
 */
export class AerodromeGeojsonResponseDTO {
  @ApiProperty({ description: 'Identificador único' })
  id!: string;
}
