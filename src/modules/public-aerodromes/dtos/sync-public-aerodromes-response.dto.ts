import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Resultado típico de `POST …/sync` aeródromos públicos quando termina ou salta HEAD/hash. */
export class SyncPublicAerodromesResponseDto {
  @ApiProperty({
    example: 'public_aerodromes',
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
    description: 'Último número de linhas conhecidas ao saltar pelo HEAD igual',
    example: 4200,
  })
  rowCount?: number;
}
