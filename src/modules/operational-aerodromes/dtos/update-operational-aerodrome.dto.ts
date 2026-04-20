import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Body para PATCH /operational-aerodromes/:id.
 *
 * TODO: adicionar campos editáveis conforme schema.prisma do model OperationalAerodrome.
 */
export class UpdateOperationalAerodromeDTO {
  @ApiPropertyOptional({ description: 'TODO: descrever campo' })
  placeholder?: string;
}
