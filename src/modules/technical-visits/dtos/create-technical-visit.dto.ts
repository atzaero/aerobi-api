import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Body para POST /technical-visits.
 *
 * TODO: adicionar campos conforme schema.prisma do model TechnicalVisit.
 */
export class CreateTechnicalVisitDTO {
  @ApiPropertyOptional({ description: 'TODO: descrever campo' })
  placeholder?: string;
}
