import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Body para POST /aerodrome-geojsons.
 *
 * TODO: adicionar campos conforme schema.prisma do model AerodromeGeojson.
 */
export class CreateAerodromeGeojsonDTO {
  @ApiPropertyOptional({ description: 'TODO: descrever campo' })
  placeholder?: string;
}
