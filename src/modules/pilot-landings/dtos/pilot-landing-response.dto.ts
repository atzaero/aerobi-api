import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Resposta de item único (model PilotLanding) — sem objeto aninhado de relação */
export class PilotLandingResponseDTO {
  @ApiProperty({ description: 'Identificador único', format: 'uuid' })
  id!: string;

  @ApiPropertyOptional({
    description: 'Aeródromo operacional associado',
    format: 'uuid',
  })
  aerodromeId?: string | null;

  @ApiProperty({ description: 'Matrícula da aeronave' })
  registration!: string;

  @ApiProperty({ description: 'Nome local do pouso' })
  localName!: string;

  @ApiProperty({ description: 'ICAO/local' })
  localIcao!: string;

  @ApiProperty({ description: 'Indica verificação do registo' })
  checked!: boolean;

  @ApiProperty({ description: 'Path/caminho das imagens' })
  imagesPath!: string;

  @ApiProperty({
    description: 'Instante do pouso em UTC (ISO 8601)',
    type: String,
    format: 'date-time',
  })
  landingAt!: string;

  @ApiProperty({
    description: 'Criação — ISO 8601',
    type: String,
    format: 'date-time',
  })
  createdAt!: string;

  @ApiPropertyOptional({
    description: 'Audit createdBy',
    type: String,
  })
  createdBy!: string | null;

  @ApiProperty({
    description: 'Última atualização — ISO 8601',
    type: String,
    format: 'date-time',
  })
  updatedAt!: string;

  @ApiPropertyOptional({ description: 'Audit updatedBy' })
  updatedBy!: string | null;

  @ApiPropertyOptional({
    description: 'Soft delete — ISO 8601 quando removido',
    type: String,
    format: 'date-time',
  })
  deletedAt!: string | null;

  @ApiPropertyOptional({ description: 'Audit deletedBy' })
  deletedBy!: string | null;
}
