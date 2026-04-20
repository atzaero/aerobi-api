import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Body para PATCH /landing-requests/:id.
 *
 * TODO: adicionar campos editáveis conforme schema.prisma do model LandingRequest.
 */
export class UpdateLandingRequestDTO {
  @ApiPropertyOptional({ description: 'TODO: descrever campo' })
  placeholder?: string;
}
