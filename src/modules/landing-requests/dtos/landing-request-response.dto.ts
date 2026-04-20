import { ApiProperty } from '@nestjs/swagger';

/**
 * Resposta de item único do model LandingRequest.
 *
 * TODO: espelhar campos do model conforme schema.prisma.
 */
export class LandingRequestResponseDTO {
  @ApiProperty({ description: 'Identificador único' })
  id!: string;
}
