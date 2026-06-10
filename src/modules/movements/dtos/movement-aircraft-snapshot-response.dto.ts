import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Snapshot 1:1 dos dados cadastrais (RAB) da aeronave congelados no instante do
 * movimento. Aninhado em {@link MovementResponseDTO.aircraftSnapshot}. Todos os
 * campos curados são `String | null` (fiéis à origem RAB); `rabRowId`/`rabPeriod`
 * dão rastreabilidade até a `rab_row`. Não expõe `confidence`.
 */
export class MovementAircraftSnapshotResponseDTO {
  @ApiPropertyOptional({ type: String, nullable: true })
  rabRowId!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  rabPeriod!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  marcas!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  proprietarios!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  operadores!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  nrSerie!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  dsModelo!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  nmFabricante!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  cdTipoIcao!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  nrPmd!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  nrAssentos!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  nrAnoFabricacao!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  tpMotor!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  qtMotor!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  cfOperacional!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  tpOperacao!: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: string;
}
