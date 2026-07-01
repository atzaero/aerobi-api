import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';

import {
  NormalizeOptionalPhone,
  TrimOptionalString,
  TrimString,
} from '@/common/transform';
import { IsE164Phone } from '@/common/validators/is-e164-phone.validator';

import { IsDmsCoordinate } from '../validators/is-dms-coordinate.validator';

/** Comprimento máximo da observação pública (paridade com o web). */
export const AERODROME_OBSERVATION_MAX_LENGTH = 2000;

/** `true` quando o campo condicional de pista veio preenchido. */
const isRunwayFieldFilled = (value: unknown): boolean =>
  value !== undefined && value !== null && value !== '';

/** Subconjunto lido pelos `@ValidateIf` da pista condicional. */
type RunwayConditionInput = {
  construction?: boolean;
  length?: string;
  width?: string;
};

/**
 * Entrada de criação de um aeródromo, alinhada ao schema Zod de
 * `aerobi-web/src/app/actions/aerodromes/create`. A UF **não** entra no payload
 * (é derivada do grupo no read); `isView`, `createdBy` e as URLs legadas
 * (`imgUrl`/`kmlUrl`/ordinances/…) também não: `isView` nasce `false` no service,
 * `createdBy` é o ator autenticado, e as URLs pertencem a slices próprias
 * (imagem → #430, KML → geojson). Os campos de pista
 * (`designation`/`length`/`width`/`resistance`/`surface`) são obrigatórios
 * quando o aeródromo **não** está em construção.
 */
export class CreateAerodromeDTO {
  @ApiProperty({
    format: 'uuid',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @IsUUID('4')
  groupId!: string;

  @ApiProperty({
    example: 'SBSP',
    description:
      'ICAO — 4 caracteres alfanuméricos (normalizado em maiúsculas)',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-z0-9]{4}$/, {
    message: 'ICAO deve ter 4 caracteres alfanuméricos',
  })
  icao!: string;

  @ApiProperty({ example: 'Aeroporto de Congonhas' })
  @TrimString()
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MaxLength(500)
  name!: string;

  @ApiPropertyOptional({ maxLength: 6, example: 'SP0001' })
  @IsOptional()
  @TrimOptionalString()
  @IsString()
  @MaxLength(6, { message: 'CIAD deve ter até 6 caracteres' })
  ciad?: string;

  @ApiPropertyOptional({ maxLength: 255, example: 'São Paulo' })
  @IsOptional()
  @TrimOptionalString()
  @IsString()
  @MaxLength(255)
  municipality?: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: '+5541999724341',
    description: 'Telefone de emergência em E.164 (ex.: +55 11 99999-9999)',
  })
  @IsOptional()
  @NormalizeOptionalPhone()
  @IsE164Phone()
  @MaxLength(32)
  emergencyPhone?: string | null;

  @ApiProperty({ example: '03°27\'18.50"S', description: 'Latitude em DMS' })
  @TrimString()
  @IsString()
  @IsNotEmpty({ message: 'Latitude é obrigatória' })
  @IsDmsCoordinate({ message: 'Latitude inválida (ex.: 03°27\'18.50"S)' })
  latitude!: string;

  @ApiProperty({ example: '041°36\'16.91"W', description: 'Longitude em DMS' })
  @TrimString()
  @IsString()
  @IsNotEmpty({ message: 'Longitude é obrigatória' })
  @IsDmsCoordinate({ message: 'Longitude inválida (ex.: 041°36\'16.91"W)' })
  longitude!: string;

  @ApiProperty({
    example: '260',
    description: 'Altitude em pés — apenas dígitos',
  })
  @TrimString()
  @IsString()
  @IsNotEmpty({ message: 'Altitude é obrigatória' })
  @Matches(/^\d+$/, { message: 'Altitude aceita apenas números' })
  altitude!: string;

  @ApiPropertyOptional({ maxLength: 255, example: 'VFR' })
  @IsOptional()
  @TrimOptionalString()
  @IsString()
  @MaxLength(255)
  operation?: string;

  @ApiPropertyOptional({
    example: '9133',
    description: 'Código da estação meteorológica — apenas dígitos',
  })
  @IsOptional()
  @TrimOptionalString()
  @IsString()
  @Matches(/^\d+$/, { message: 'Código da estação aceita apenas números' })
  weatherStationCode?: string;

  @ApiPropertyOptional({ default: false, example: false })
  @IsOptional()
  @IsBoolean()
  construction?: boolean;

  @ApiPropertyOptional({
    example: '02/20',
    description: 'Designação da pista (obrigatória se não em construção)',
  })
  @ValidateIf((o: RunwayConditionInput) => o.construction !== true)
  @TrimOptionalString()
  @IsString()
  @IsNotEmpty({
    message: 'Designação é obrigatória quando não está em construção',
  })
  @MaxLength(500)
  designation?: string;

  @ApiPropertyOptional({
    example: '1200',
    description:
      'Comprimento da pista em metros — apenas dígitos (obrigatório se não em construção)',
  })
  @ValidateIf(
    (o: RunwayConditionInput) =>
      o.construction !== true || isRunwayFieldFilled(o.length),
  )
  @TrimOptionalString()
  @IsNotEmpty({
    message: 'Comprimento é obrigatório quando não está em construção',
  })
  @Matches(/^\d+$/, { message: 'Comprimento aceita apenas números' })
  length?: string;

  @ApiPropertyOptional({
    example: '20',
    description:
      'Largura da pista em metros — apenas dígitos (obrigatória se não em construção)',
  })
  @ValidateIf(
    (o: RunwayConditionInput) =>
      o.construction !== true || isRunwayFieldFilled(o.width),
  )
  @TrimOptionalString()
  @IsNotEmpty({
    message: 'Largura é obrigatória quando não está em construção',
  })
  @Matches(/^\d+$/, { message: 'Largura aceita apenas números' })
  width?: string;

  @ApiPropertyOptional({
    example: '5700Kg/1.25MPa',
    description: 'Resistência da pista (obrigatória se não em construção)',
  })
  @ValidateIf((o: RunwayConditionInput) => o.construction !== true)
  @TrimOptionalString()
  @IsString()
  @IsNotEmpty({
    message: 'Resistência é obrigatória quando não está em construção',
  })
  @MaxLength(64)
  resistance?: string;

  @ApiPropertyOptional({
    example: 'Asfalto',
    description:
      'Tipo de superfície da pista (obrigatório se não em construção)',
  })
  @ValidateIf((o: RunwayConditionInput) => o.construction !== true)
  @TrimOptionalString()
  @IsString()
  @IsNotEmpty({
    message: 'Tipo de superfície é obrigatório quando não está em construção',
  })
  @MaxLength(64)
  surface?: string;

  @ApiPropertyOptional({
    default: true,
    example: true,
    description: 'Aeródromo aberto (default true)',
  })
  @IsOptional()
  @IsBoolean()
  isOpen?: boolean;

  @ApiPropertyOptional({ default: false, example: false })
  @IsOptional()
  @IsBoolean()
  weatherStationDisplay?: boolean;

  @ApiPropertyOptional({ default: false, example: true })
  @IsOptional()
  @IsBoolean()
  lit?: boolean;

  @ApiPropertyOptional({ default: false, example: false })
  @IsOptional()
  @IsBoolean()
  fueling?: boolean;

  @ApiPropertyOptional({
    maxLength: AERODROME_OBSERVATION_MAX_LENGTH,
    example: 'Atenção à linha elétrica na aproximação 20',
  })
  @IsOptional()
  @TrimOptionalString()
  @IsString()
  @MaxLength(AERODROME_OBSERVATION_MAX_LENGTH, {
    message: 'Observação deve ter até 2000 caracteres',
  })
  observation?: string;
}
