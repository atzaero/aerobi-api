import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

/**
 * Param de rota das consultas públicas por aeródromo (`:aerodromeId`). Nome
 * distinto de `GeojsonParamDTO.id` — estas rotas não usam `GroupScopeGuard`.
 */
export class GeojsonAerodromeIdParamDTO {
  @ApiProperty({ format: 'uuid', description: 'Identificador do aeródromo.' })
  @IsUUID('4')
  aerodromeId!: string;
}
