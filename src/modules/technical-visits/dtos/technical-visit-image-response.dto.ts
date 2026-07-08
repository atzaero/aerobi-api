import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TechnicalVisitImageSection } from '@/generated/prisma/client';

import {
  TECHNICAL_VISIT_EXAMPLE_ACTOR_ID,
  TECHNICAL_VISIT_EXAMPLE_VISIT_ID,
} from '../docs/technical-visit.examples';

export class TechnicalVisitImageResponseDTO {
  @ApiProperty({
    format: 'uuid',
    example: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  })
  id!: string;

  @ApiProperty({
    format: 'uuid',
    example: TECHNICAL_VISIT_EXAMPLE_VISIT_ID,
  })
  technicalVisitId!: string;

  @ApiProperty({
    enum: TechnicalVisitImageSection,
    example: TechnicalVisitImageSection.fence,
  })
  section!: TechnicalVisitImageSection;

  @ApiPropertyOptional({
    type: String,
    example: 'https://minio.example/aerobi-dev/presigned',
  })
  imageUrl!: string | null;

  @ApiProperty({ example: 'cerca-aeroporto-congonhas.jpg' })
  originalFilename!: string;

  @ApiProperty({ example: 'image/jpeg' })
  mimeType!: string;

  @ApiProperty({ example: 245760 })
  sizeBytes!: number;

  @ApiPropertyOptional({
    type: String,
    format: 'uuid',
    example: TECHNICAL_VISIT_EXAMPLE_ACTOR_ID,
  })
  uploadedBy!: string | null;

  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2024-06-01T09:00:00.000Z',
  })
  createdAt!: string;

  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2024-06-01T09:00:00.000Z',
  })
  updatedAt!: string;
}
