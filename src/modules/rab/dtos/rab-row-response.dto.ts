import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** RAB CSV row as stored; mirrors Prisma `RabRow` for OpenAPI. */
export class RabRowResponseDTO {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: '2026-03' })
  period: string;

  @ApiProperty({ description: 'Aircraft registration (marcas)' })
  marcas: string;

  @ApiPropertyOptional()
  proprietarios?: string | null;

  @ApiPropertyOptional()
  operadores?: string | null;

  @ApiPropertyOptional()
  nrCertMatricula?: string | null;

  @ApiPropertyOptional()
  nrSerie?: string | null;

  @ApiPropertyOptional()
  cdTipo?: string | null;

  @ApiPropertyOptional()
  dsModelo?: string | null;

  @ApiPropertyOptional()
  nmFabricante?: string | null;

  @ApiPropertyOptional()
  cdCls?: string | null;

  @ApiPropertyOptional()
  nrPmd?: string | null;

  @ApiPropertyOptional()
  cdTipoIcao?: string | null;

  @ApiPropertyOptional()
  nrTripulacaoMin?: string | null;

  @ApiPropertyOptional()
  nrPassageirosMax?: string | null;

  @ApiPropertyOptional()
  nrAssentos?: string | null;

  @ApiPropertyOptional()
  nrAnoFabricacao?: string | null;

  @ApiPropertyOptional()
  dtValidadeCva?: string | null;

  @ApiPropertyOptional()
  dtValidadeCa?: string | null;

  @ApiPropertyOptional()
  dtCanc?: string | null;

  @ApiPropertyOptional()
  dsMotivoCanc?: string | null;

  @ApiPropertyOptional()
  cdInterdicao?: string | null;

  @ApiPropertyOptional()
  dsGravame?: string | null;

  @ApiPropertyOptional()
  dtMatricula?: string | null;

  @ApiPropertyOptional()
  tpMotor?: string | null;

  @ApiPropertyOptional()
  qtMotor?: string | null;

  @ApiPropertyOptional()
  tpPouso?: string | null;

  @ApiPropertyOptional()
  tpCa?: string | null;

  @ApiPropertyOptional()
  cdPropositoCave?: string | null;

  @ApiPropertyOptional()
  cfOperacional?: string | null;

  @ApiPropertyOptional()
  dsCategoriaHomologacao?: string | null;

  @ApiPropertyOptional()
  tpOperacao?: string | null;
}
