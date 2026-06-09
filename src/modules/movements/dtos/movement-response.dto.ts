import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Resposta (camelCase) de uma leitura nas rotas de consulta (`GET /readings`,
 * `GET /readings/:id`, `DELETE /readings/:id`). `imageUrl` é uma presigned URL
 * temporária (ou `null`).
 */
export class MovementResponseDTO {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'PR-ZTT' })
  registration!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  readingDatetime!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  readingStatus!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  revisorId!: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'Presigned URL da imagem (expira em ~1h) ou null.',
  })
  imageUrl!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  comments!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  aerodrome!: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: string;
}
