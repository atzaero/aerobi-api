import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Body para POST /landing-requests.
 *
 * TODO: adicionar campos conforme schema.prisma do model LandingRequest.
 */
export class CreateLandingRequestDTO {
  @ApiPropertyOptional({ description: 'TODO: descrever campo' })
  placeholder?: string;
}
