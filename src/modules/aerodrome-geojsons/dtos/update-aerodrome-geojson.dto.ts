import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Body para PATCH /aerodrome-geojsons/:id.
 *
 * TODO: adicionar campos editáveis conforme schema.prisma do model AerodromeGeojson.
 */
export class UpdateAerodromeGeojsonDTO {
  @ApiPropertyOptional({ description: 'TODO: descrever campo' })
  placeholder?: string;
}
