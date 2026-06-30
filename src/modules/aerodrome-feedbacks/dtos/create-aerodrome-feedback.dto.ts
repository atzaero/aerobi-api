import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

import { FeedbackRating } from '@/generated/prisma/client';

/** Body POST /aerodrome-feedbacks */
export class CreateAerodromeFeedbackDTO {
  @ApiProperty({
    description: 'Aeródromo avaliado',
    format: 'uuid',
  })
  @IsUUID('4')
  aerodromeId!: string;

  @ApiProperty({ enum: FeedbackRating })
  @IsEnum(FeedbackRating)
  rating!: FeedbackRating;

  @ApiPropertyOptional({ description: 'Comentário livre', maxLength: 10000 })
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  comment?: string;

  @ApiProperty({
    description:
      'Identificador de sessão anonimizada (único por dia/aeródromo)',
    example: 'sess-a1b2c3',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  sessionHash!: string;

  @ApiProperty({
    description:
      'Data da avaliação (timezone local convertido a Date ISO midnigh UTC)',
    example: '2024-06-01T00:00:00.000Z',
  })
  @Type(() => Date)
  @IsDate()
  feedbackDate!: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  createdBy?: string;
}
