import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * Corpo do `POST /readings/batch` (multipart/form-data). `metadata` é uma string
 * JSON com o array de itens (ver BatchReadingItemDTO); os arquivos vão no campo
 * `images` e são referenciados por `image_index` em cada item.
 */
export class CreateAircraftReadingBatchDTO {
  @ApiProperty({
    description: 'JSON (string) com o array de itens da leitura.',
    example:
      '[{"registration":"PR-ZTT","confidence":"0.98","reading_datetime":"2026-06-08T16:52:39Z","aerodrome":"SSCF","image_index":0}]',
  })
  @IsString()
  @IsNotEmpty()
  metadata!: string;
}

/** Status de processamento de um item do lote. */
export type BatchItemStatus = 'created' | 'failed';

/**
 * Resultado por item (mesma ordem do array `metadata`). Itens criados trazem
 * `id`/`image_path`; itens que falharam trazem `error` — o cliente pode reenviar
 * apenas os que falharam, sem duplicar os já criados.
 */
export class BatchReadingResultItemDTO {
  @ApiProperty({ example: 0, description: 'Índice do item no array metadata.' })
  index!: number;

  @ApiProperty({ enum: ['created', 'failed'] })
  status!: BatchItemStatus;

  @ApiPropertyOptional({ type: String, format: 'uuid', nullable: true })
  id!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  image_path!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  error!: string | null;
}

/** Resposta do `POST /readings/batch`. */
export class CreateAircraftReadingBatchResponseDTO {
  @ApiProperty({ example: 3, description: 'Itens criados com sucesso.' })
  created!: number;

  @ApiProperty({
    example: 0,
    description: 'Itens que falharam no processamento.',
  })
  failed!: number;

  @ApiProperty({ type: [BatchReadingResultItemDTO] })
  items!: BatchReadingResultItemDTO[];
}
