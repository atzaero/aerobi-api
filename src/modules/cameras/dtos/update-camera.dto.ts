import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

import { TrimOptionalString } from '@/common/transform';

import {
  CAMERA_NAME_MAX,
  CAMERA_NAME_MIN,
  MEDIAMTX_FIELD_MAX,
  MEDIAMTX_NODE_PATTERN,
  MEDIAMTX_PATH_PATTERN,
} from '../utils/mediamtx.patterns';

/**
 * Body do `PATCH /cameras/:id` (semântica PATCH: só os campos enviados mudam). O
 * `aerodromeId`/`icao` **não** são editáveis aqui — a câmera não troca de
 * aeródromo pelo CRUD, mantendo o `icao` desnormalizado coerente.
 */
export class UpdateCameraDTO {
  @ApiPropertyOptional({
    minLength: CAMERA_NAME_MIN,
    maxLength: CAMERA_NAME_MAX,
  })
  @IsOptional()
  @TrimOptionalString()
  @IsString()
  @IsNotEmpty()
  @MinLength(CAMERA_NAME_MIN)
  @MaxLength(CAMERA_NAME_MAX)
  name?: string;

  @ApiPropertyOptional({
    example: 'aerobi-edge-mvp',
    maxLength: MEDIAMTX_FIELD_MAX,
  })
  @IsOptional()
  @TrimOptionalString()
  @IsString()
  @IsNotEmpty()
  @MaxLength(MEDIAMTX_FIELD_MAX)
  @Matches(MEDIAMTX_NODE_PATTERN, {
    message:
      'mediamtxNode deve ser um hostname/IP válido (letras, dígitos, ponto e hífen)',
  })
  mediamtxNode?: string;

  @ApiPropertyOptional({ example: 'sbxx-cam-1', maxLength: MEDIAMTX_FIELD_MAX })
  @IsOptional()
  @TrimOptionalString()
  @IsString()
  @IsNotEmpty()
  @MaxLength(MEDIAMTX_FIELD_MAX)
  @Matches(MEDIAMTX_PATH_PATTERN, {
    message:
      'mediamtxPath deve conter apenas letras, dígitos, ponto, hífen e underscore (sem barras)',
  })
  mediamtxPath?: string;

  @ApiPropertyOptional({ description: 'Liga/desliga a câmera' })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
