import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

/**
 * Query do resumo público `GET /aerodrome-feedbacks/summary`. Exige o aeródromo
 * alvo; os contadores são agregados apenas sobre feedbacks ativos.
 */
export class AerodromeFeedbackSummaryQueryDTO {
  @ApiProperty({ description: 'Aeródromo a resumir', format: 'uuid' })
  @IsUUID('4')
  aerodromeId!: string;
}
