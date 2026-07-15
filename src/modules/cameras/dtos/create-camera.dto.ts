import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

import { TrimString } from '@/common/transform';

import {
  CAMERA_NAME_MAX,
  CAMERA_NAME_MIN,
  MEDIAMTX_FIELD_MAX,
  MEDIAMTX_NODE_PATTERN,
  MEDIAMTX_PATH_PATTERN,
} from '../utils/mediamtx.patterns';

/**
 * Body do `POST /cameras`. O `icao` **não** é aceito do cliente — é derivado do
 * aeródromo de destino (`aerodromeId`) e mantido desnormalizado em sincronia.
 * `enabled` assume `true` no servidor quando ausente.
 */
export class CreateCameraDTO {
  @ApiProperty({ description: 'Aeródromo dono da câmera', format: 'uuid' })
  @IsUUID('4')
  aerodromeId!: string;

  @ApiProperty({
    description: 'Nome de exibição da câmera',
    minLength: CAMERA_NAME_MIN,
    maxLength: CAMERA_NAME_MAX,
    example: 'Cabeceira 06',
  })
  @TrimString()
  @IsString()
  @IsNotEmpty()
  @MinLength(CAMERA_NAME_MIN)
  @MaxLength(CAMERA_NAME_MAX)
  name!: string;

  @ApiProperty({
    description: 'Nó mediamtx (hostname/IP da tailnet)',
    example: 'aerobi-edge-mvp',
    maxLength: MEDIAMTX_FIELD_MAX,
  })
  @TrimString()
  @IsString()
  @IsNotEmpty()
  @MaxLength(MEDIAMTX_FIELD_MAX)
  @Matches(MEDIAMTX_NODE_PATTERN, {
    message:
      'mediamtxNode deve ser um hostname/IP válido (letras, dígitos, ponto e hífen)',
  })
  mediamtxNode!: string;

  @ApiProperty({
    description: 'Path do stream no mediamtx',
    example: 'sbxx-cam-1',
    maxLength: MEDIAMTX_FIELD_MAX,
  })
  @TrimString()
  @IsString()
  @IsNotEmpty()
  @MaxLength(MEDIAMTX_FIELD_MAX)
  @Matches(MEDIAMTX_PATH_PATTERN, {
    message:
      'mediamtxPath deve conter apenas letras, dígitos, ponto, hífen e underscore (sem barras)',
  })
  mediamtxPath!: string;

  @ApiPropertyOptional({
    description: 'Câmera ligada (default true)',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
