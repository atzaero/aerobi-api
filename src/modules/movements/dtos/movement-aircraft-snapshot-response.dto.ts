import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { RabOperadorDTO, RabProprietarioDTO } from './rab-people-response.dto';

/**
 * Snapshot 1:1 dos dados cadastrais (RAB) da aeronave congelados no instante do
 * movimento. Aninhado em {@link MovementResponseDTO.aircraftSnapshot}. Os campos
 * curados são `String | null` (fiéis à origem RAB); `rabRowId`/`rabPeriod` dão
 * rastreabilidade até a `rab_row`. `proprietarios`/`operadores` são normalizados
 * de JSON-como-texto para arrays tipados antes de sair da API (vazio/ilegível →
 * `[]`). Não expõe `confidence`.
 */
export class MovementAircraftSnapshotResponseDTO {
  @ApiPropertyOptional({ type: String, nullable: true })
  rabRowId!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  rabPeriod!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  marcas!: string | null;

  @ApiProperty({
    type: [RabProprietarioDTO],
    description:
      'Proprietários da aeronave, normalizados do RAB. `[]` quando ausente ou ilegível.',
  })
  proprietarios!: RabProprietarioDTO[];

  @ApiProperty({
    type: [RabOperadorDTO],
    description:
      'Operadores da aeronave, normalizados do RAB. `[]` quando ausente ou ilegível.',
  })
  operadores!: RabOperadorDTO[];

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
