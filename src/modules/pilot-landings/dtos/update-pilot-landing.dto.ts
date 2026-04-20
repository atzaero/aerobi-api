import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Body para PATCH /pilot-landings/:id.
 *
 * TODO: adicionar campos editáveis conforme schema.prisma do model PilotLanding.
 */
export class UpdatePilotLandingDTO {
  @ApiPropertyOptional({ description: 'TODO: descrever campo' })
  placeholder?: string;
}
