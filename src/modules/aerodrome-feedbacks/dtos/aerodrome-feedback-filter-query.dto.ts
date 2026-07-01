import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

import {
  IsYmdDate,
  IsYmdDateOnOrAfter,
} from '@/common/validators/is-ymd-date.validator';
import { FeedbackRating } from '@/generated/prisma/client';

/**
 * Filtros compartilhados da moderação de feedbacks (listagem e exportação):
 * aeródromo, avaliação e um intervalo de `feedbackDate` (`YYYY-MM-DD`, inclusivo,
 * com `endDate >= startDate`). Fonte única para `ListAerodromeFeedbacksQueryDTO`
 * (via `IntersectionType` com a paginação) e `ExportAerodromeFeedbacksQueryDTO` —
 * para list e export nunca divergirem de contrato.
 */
export class AerodromeFeedbackFilterQueryDTO {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  aerodromeId?: string;

  @ApiPropertyOptional({ enum: FeedbackRating })
  @IsOptional()
  @IsEnum(FeedbackRating)
  rating?: FeedbackRating;

  @ApiPropertyOptional({
    description: 'Início do intervalo de feedbackDate (YYYY-MM-DD, inclusivo)',
    example: '2026-01-01',
  })
  @IsOptional()
  @IsYmdDate()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Fim do intervalo de feedbackDate (YYYY-MM-DD, inclusivo)',
    example: '2026-12-31',
  })
  @IsOptional()
  @IsYmdDate()
  @IsYmdDateOnOrAfter('startDate')
  endDate?: string;
}
