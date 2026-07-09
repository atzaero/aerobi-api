import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsUUID, Min } from 'class-validator';

import type { DashboardRangePreset } from './dashboard-response.dto';

/** Presets aceitos; `custom` exige `from`/`to` (validado no service). */
const RANGE_PRESETS: readonly DashboardRangePreset[] = [
  '7d',
  '30d',
  '90d',
  '12m',
  'custom',
];

/**
 * Query de `GET /dashboard`. `from`/`to` em **ms epoch** (paridade com o web).
 * O par `custom ⇒ from/to com from ≤ to` é validado no service (mensagem
 * `VALIDATION_FAILED`), não aqui.
 */
export class GetDashboardQueryDTO {
  @ApiPropertyOptional({
    enum: RANGE_PRESETS,
    default: '30d',
    description: 'Faixa de tempo pré-definida. Default `30d`.',
  })
  @IsOptional()
  @IsIn(RANGE_PRESETS)
  preset: DashboardRangePreset = '30d';

  @ApiPropertyOptional({
    description:
      'Início da faixa em ms epoch. Obrigatório quando `preset=custom`.',
    example: 1751932800000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  from?: number;

  @ApiPropertyOptional({
    description:
      'Fim da faixa em ms epoch. Obrigatório quando `preset=custom`.',
    example: 1754524800000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  to?: number;

  @ApiPropertyOptional({
    description:
      'Filtra dentro do escopo já autorizado (interseção; nunca amplia). Reservado ao seletor v2.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  aerodromeId?: string;
}
