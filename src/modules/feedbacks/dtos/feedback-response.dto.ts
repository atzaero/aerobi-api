import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { FeedbackRating } from '@/generated/prisma/client';

export class FeedbackResponseDTO {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  aerodromeId!: string;

  @ApiProperty({ enum: FeedbackRating })
  rating!: FeedbackRating;

  @ApiPropertyOptional({ nullable: true, type: String })
  comment!: string | null;

  @ApiProperty()
  sessionHash!: string;

  @ApiProperty({
    description: 'Data avaliação (YYYY-MM-DD)',
    type: String,
    format: 'date',
  })
  feedbackDate!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  createdBy!: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  updatedBy!: string | null;

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  deletedAt!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  deletedBy!: string | null;
}
