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

/** Item do resultado do lote. */
export class BatchReadingResultItemDTO {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  image_path!: string | null;
}

/** Resposta do `POST /readings/batch`. */
export class CreateAircraftReadingBatchResponseDTO {
  @ApiProperty({ example: 3, description: 'Quantidade de leituras criadas.' })
  created!: number;

  @ApiProperty({ type: [BatchReadingResultItemDTO] })
  items!: BatchReadingResultItemDTO[];
}
