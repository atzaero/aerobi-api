import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Corpo típico de `POST /rab/sync` (200) quando a sync conclui ou é ignorada. */
export class SyncRabResponseDto {
  @ApiProperty({
    description: 'Etiqueta de período tratada na execução (ex. ANO-MÊS).',
    example: '2026-03',
  })
  period!: string;

  @ApiProperty({
    description: 'Se verdadeiro, nenhuma escrita nova foi aplicada ao dataset.',
    example: false,
  })
  skipped!: boolean;

  @ApiPropertyOptional({
    description: 'Motivo humano-readable quando houve skip ou erro de negócio.',
  })
  reason?: string;

  @ApiPropertyOptional({
    description: 'Número de linhas afectadas/processadas quando aplicável.',
    example: 15000,
  })
  rowCount?: number;
}
