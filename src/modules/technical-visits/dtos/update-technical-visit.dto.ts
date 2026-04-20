import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Body para PATCH /technical-visits/:id.
 *
 * TODO: adicionar campos editáveis conforme schema.prisma do model TechnicalVisit.
 */
export class UpdateTechnicalVisitDTO {
  @ApiPropertyOptional({ description: 'TODO: descrever campo' })
  placeholder?: string;
}
