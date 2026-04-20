import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Body para PATCH /aerodrome-groups/:id.
 *
 * TODO: adicionar campos editáveis conforme schema.prisma do model AerodromeGroup.
 */
export class UpdateAerodromeGroupDTO {
  @ApiPropertyOptional({ description: 'TODO: descrever campo' })
  placeholder?: string;
}
