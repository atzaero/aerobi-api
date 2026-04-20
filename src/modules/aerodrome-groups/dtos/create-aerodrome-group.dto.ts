import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Body para POST /aerodrome-groups.
 *
 * TODO: adicionar campos conforme schema.prisma do model AerodromeGroup.
 */
export class CreateAerodromeGroupDTO {
  @ApiPropertyOptional({ description: 'TODO: descrever campo' })
  placeholder?: string;
}
