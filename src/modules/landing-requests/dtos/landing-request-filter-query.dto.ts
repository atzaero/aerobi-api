import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

import { TrimOptionalString } from '@/common/transform';
import {
  IsYmdDate,
  IsYmdDateOnOrAfter,
} from '@/common/validators/is-ymd-date.validator';
import { LandingRequestStatus } from '@/generated/prisma/client';

/**
 * Filtros compartilhados de listagem/exportação de solicitações de pouso
 * (moderação interna). Fonte única para `ListLandingRequestsQueryDTO` (via
 * `IntersectionType` com a paginação) e `ExportLandingRequestsQueryDTO` — para
 * list e export nunca divergirem de contrato.
 *
 * `status`/`aerodromeId` filtram por igualdade; os demais textuais por
 * **substring case-insensitive** (paridade com `lib/landing-request-filters.ts`
 * do web). Os intervalos `YYYY-MM-DD` (inclusivos) filtram `requestDate` e
 * `reviewedAt` (`responseDate` no legado).
 */
export class LandingRequestFilterQueryDTO {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  aerodromeId?: string;

  @ApiPropertyOptional({ enum: LandingRequestStatus })
  @IsOptional()
  @IsEnum(LandingRequestStatus)
  status?: LandingRequestStatus;

  @ApiPropertyOptional({ description: 'ICAO de partida (substring)' })
  @IsOptional()
  @TrimOptionalString()
  @IsString()
  @MaxLength(64)
  departureIcao?: string;

  @ApiPropertyOptional({ description: 'ICAO de chegada (substring)' })
  @IsOptional()
  @TrimOptionalString()
  @IsString()
  @MaxLength(64)
  arrivalIcao?: string;

  @ApiPropertyOptional({ description: 'Modelo da aeronave (substring)' })
  @IsOptional()
  @TrimOptionalString()
  @IsString()
  @MaxLength(80)
  aircraftModel?: string;

  @ApiPropertyOptional({ description: 'Matrícula da aeronave (substring)' })
  @IsOptional()
  @TrimOptionalString()
  @IsString()
  @MaxLength(64)
  aircraftRegistration?: string;

  @ApiPropertyOptional({ description: 'Código ANAC do piloto (substring)' })
  @IsOptional()
  @TrimOptionalString()
  @IsString()
  @MaxLength(64)
  pilotCode?: string;

  @ApiPropertyOptional({ description: 'E-mail do solicitante (substring)' })
  @IsOptional()
  @TrimOptionalString()
  @IsString()
  @MaxLength(320)
  email?: string;

  @ApiPropertyOptional({
    description: 'Início do intervalo de requestDate (YYYY-MM-DD, inclusivo)',
    example: '2026-01-01',
  })
  @IsOptional()
  @IsYmdDate()
  requestDateFrom?: string;

  @ApiPropertyOptional({
    description: 'Fim do intervalo de requestDate (YYYY-MM-DD, inclusivo)',
    example: '2026-12-31',
  })
  @IsOptional()
  @IsYmdDate()
  @IsYmdDateOnOrAfter('requestDateFrom')
  requestDateTo?: string;

  @ApiPropertyOptional({
    description: 'Início do intervalo de responseDate (YYYY-MM-DD, inclusivo)',
    example: '2026-01-01',
  })
  @IsOptional()
  @IsYmdDate()
  responseDateFrom?: string;

  @ApiPropertyOptional({
    description: 'Fim do intervalo de responseDate (YYYY-MM-DD, inclusivo)',
    example: '2026-12-31',
  })
  @IsOptional()
  @IsYmdDate()
  @IsYmdDateOnOrAfter('responseDateFrom')
  responseDateTo?: string;
}
