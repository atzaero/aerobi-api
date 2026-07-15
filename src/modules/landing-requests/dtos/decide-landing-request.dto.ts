import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

import { TrimOptionalString } from '@/common/transform';
import { LandingRequestStatus } from '@/generated/prisma/client';

/** Estados-alvo válidos de uma decisão (nunca `PENDING`). */
export const LANDING_REQUEST_DECISIONS = [
  LandingRequestStatus.APPROVED,
  LandingRequestStatus.REJECTED,
] as const;

/**
 * Body do `PATCH /landing-requests/:id/decision` — decisão do coordenador sobre
 * uma solicitação pendente. Espelha `decide/schema.ts` do `aerobi-web`:
 * `decision` só aprova/recusa e `observation` é opcional (só sobrescreve a do
 * solicitante quando enviada).
 */
export class DecideLandingRequestDTO {
  @ApiProperty({ enum: LANDING_REQUEST_DECISIONS })
  @IsIn(LANDING_REQUEST_DECISIONS)
  decision!: (typeof LANDING_REQUEST_DECISIONS)[number];

  @ApiPropertyOptional({ maxLength: 2000 })
  @IsOptional()
  @TrimOptionalString()
  @IsString()
  @MaxLength(2000)
  observation?: string;
}
