import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Resultado típico de `POST …/sync` aeródromos privados quando termina ou salta HEAD/hash. */
export class SyncPrivateAerodromesResponseDto {
  @ApiProperty({
    example: 'private_aerodromes',
    description: 'Chave lógica do dataset no estado de sync',
  })
  datasetKey!: string;

  @ApiProperty({ description: 'Nenhuma descarga/import quando true' })
  skipped!: boolean;

  @ApiPropertyOptional({
    enum: ['unchanged_head', 'unchanged_hash'],
    description: 'Motivo do skip quando `skipped=true`',
  })
  reason?: 'unchanged_head' | 'unchanged_hash';

  @ApiPropertyOptional({
    description: 'Número de linhas tratadas quando presente na resposta.',
    example: 2100,
  })
  rowCount?: number;
}
