import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

/**
 * Param de rota das operações sobre um recurso individual (`:id`). O nome `id`
 * é o esperado pelo `GroupScopeGuard` (`request.params.id`) ao resolver o escopo
 * por grupo — seja pelo próprio GeoJSON (`GroupScopeSubject.GEOJSON`) nas rotas
 * por `geojsonId`, seja pelo aeródromo (`GroupScopeSubject.AERODROME`) nas rotas
 * `/aerodrome/:id` (onde `id` é o `aerodromeId`).
 */
export class GeojsonParamDTO {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  id!: string;
}
