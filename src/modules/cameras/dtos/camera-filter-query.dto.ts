import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

import { TrimOptionalString } from '@/common/transform';

import { CAMERA_NAME_MAX, ICAO_PATTERN } from '../utils/mediamtx.patterns';

/**
 * Filtros de listagem de câmeras (moderação interna): `icao` (igualdade
 * case-insensitive — normalizado para maiúsculas na entrada) e `name` (substring
 * case-insensitive). Fonte única do `ListCamerasQueryDTO` (via `IntersectionType`
 * com a paginação).
 */
export class CameraFilterQueryDTO {
  @ApiPropertyOptional({
    description: 'Filtra por ICAO exato (case-insensitive)',
    example: 'SBXX',
  })
  @IsOptional()
  @TrimOptionalString()
  @IsString()
  @Length(4, 4)
  @Matches(ICAO_PATTERN)
  icao?: string;

  @ApiPropertyOptional({
    description: 'Filtra por substring do nome (case-insensitive)',
    maxLength: CAMERA_NAME_MAX,
  })
  @IsOptional()
  @TrimOptionalString()
  @IsString()
  @MaxLength(CAMERA_NAME_MAX)
  name?: string;
}
