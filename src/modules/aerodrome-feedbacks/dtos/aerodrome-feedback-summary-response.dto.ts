import { ApiProperty } from '@nestjs/swagger';

/**
 * Resposta do resumo público de feedbacks de um aeródromo: contadores de
 * avaliações ativas (`positive`/`negative`) e o `total` (= positive + negative).
 * Espelha o `FeedbackSummary` do `aerobi-web`.
 */
export class AerodromeFeedbackSummaryResponseDTO {
  @ApiProperty({ format: 'uuid' })
  aerodromeId!: string;

  @ApiProperty({ description: 'Total de avaliações positivas ativas' })
  positive!: number;

  @ApiProperty({ description: 'Total de avaliações negativas ativas' })
  negative!: number;

  @ApiProperty({
    description: 'Total de avaliações ativas (positive + negative)',
  })
  total!: number;
}
