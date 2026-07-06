import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { DOCUMENT_TYPE_API_VALUES } from '../utils/document-type';

/**
 * Response de um documento. `type` em lowercase (paridade web); `url` é
 * **presigned best-effort** resolvida a partir da `storageKey` (null se falhar).
 * Não expõe `storageKey`/`deletedAt`/`deletedBy` (internos).
 */
export class DocumentResponseDTO {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  aerodromeId!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  uf!: string | null;

  @ApiProperty({ enum: DOCUMENT_TYPE_API_VALUES })
  type!: string;

  @ApiProperty()
  originalFilename!: string;

  @ApiProperty()
  mimeType!: string;

  @ApiProperty()
  sizeBytes!: number;

  @ApiPropertyOptional({
    nullable: true,
    type: String,
    description:
      'URL presigned (TTL 1h) — null se o storage estiver indisponível.',
  })
  url!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  uploadedBy!: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: string;
}
