import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Body para POST /pilot-landings.
 *
 * TODO: adicionar campos conforme schema.prisma do model PilotLanding.
 */
export class CreatePilotLandingDTO {
  @ApiPropertyOptional({ description: 'TODO: descrever campo' })
  placeholder?: string;
}
