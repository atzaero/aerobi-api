import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Body para POST /operational-aerodromes.
 *
 * TODO: adicionar campos conforme schema.prisma do model OperationalAerodrome.
 */
export class CreateOperationalAerodromeDTO {
  @ApiPropertyOptional({ description: 'TODO: descrever campo' })
  placeholder?: string;
}
