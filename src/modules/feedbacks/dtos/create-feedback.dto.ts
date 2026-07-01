import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

import { TrimOptionalString, TrimString } from '@/common/transform';
import { FeedbackRating } from '@/generated/prisma/client';

/**
 * Body do `POST /feedbacks` (envio público/anônimo). `feedbackDate`
 * (dia UTC do rate-limit) e `createdBy` são **derivados no servidor** — o
 * cliente não os informa (paridade com o envio público do `aerobi-web`).
 */
export class CreateFeedbackDTO {
  @ApiProperty({
    description: 'Aeródromo avaliado',
    format: 'uuid',
  })
  @IsUUID('4')
  aerodromeId!: string;

  @ApiProperty({ enum: FeedbackRating })
  @IsEnum(FeedbackRating)
  rating!: FeedbackRating;

  @ApiPropertyOptional({ description: 'Comentário livre', maxLength: 500 })
  @IsOptional()
  @TrimOptionalString()
  @IsString()
  @MaxLength(500)
  comment?: string;

  @ApiProperty({
    description:
      'Identificador de sessão anonimizada (único por dia/aeródromo)',
    example: 'sess-a1b2c3',
  })
  @TrimString()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  sessionHash!: string;
}
