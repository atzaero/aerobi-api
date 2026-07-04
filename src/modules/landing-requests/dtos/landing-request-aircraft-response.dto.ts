import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Snapshot RAB da aeronave gravado no create (espelha `RabRow`). Exposto no
 * `GET /landing-requests/:id` quando a matrícula nacional foi encontrada no RAB.
 * Campos opcionais refletem colunas ausentes no registro oficial.
 */
export class LandingRequestAircraftResponseDTO {
  @ApiProperty({ example: '2026-07' })
  period!: string;

  @ApiProperty({ example: 'PTABC' })
  marcas!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  proprietarios!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  operadores!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  nrCertMatricula!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  nrSerie!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  cdTipo!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  dsModelo!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  nmFabricante!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  cdCls!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  nrPmd!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  cdTipoIcao!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  nrTripulacaoMin!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  nrPassageirosMax!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  nrAssentos!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  nrAnoFabricacao!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  dtValidadeCva!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  dtValidadeCa!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  dtCanc!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  dsMotivoCanc!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  cdInterdicao!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  dsGravame!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  dtMatricula!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  tpMotor!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  qtMotor!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  tpPouso!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  tpCa!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  cdPropositoCave!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  cfOperacional!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  dsCategoriaHomologacao!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  tpOperacao!: string | null;
}
