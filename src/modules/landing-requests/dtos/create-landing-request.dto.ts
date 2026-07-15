import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  Equals,
  IsBoolean,
  IsDate,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

import { NormalizeEmail, NormalizeOptionalPhone } from '@/common/transform';
import { IsCpf } from '@/common/validators/is-cpf.validator';
import { IsE164Phone } from '@/common/validators/is-e164-phone.validator';

type TransformArgs = { value: unknown };

/** trim + uppercase de um código ICAO (mantém não-strings intactas). */
const upperIcao = ({ value }: TransformArgs): unknown =>
  typeof value === 'string' ? value.trim().toUpperCase() : value;

/** Remove tudo que não é dígito (máscara do CPF). */
const stripCpfDigits = ({ value }: TransformArgs): unknown =>
  typeof value === 'string' ? value.replace(/\D/g, '') : value;

/**
 * Body do `POST /landing-requests` — **envio público** do formulário de
 * solicitação de pouso (piloto externo, sem login). Espelha o schema Zod do
 * `aerobi-web` (`lib/landing-request-form-schema.ts` + `landing-request-zod-refine.ts`).
 *
 * O DTO cobre tipos/formatos/obrigatoriedade de cada campo; as **regras cruzadas
 * temporais** (`departureAt < landingAt < exitAfterLandingAt`, `landingAt` ≥
 * agora + 3h) e a **validação da matrícula** por tipo (nacional/estrangeira) são
 * aplicadas no service (dependem de `now` / de `foreignRegistration`). `icao` e
 * `uf` **não** entram aqui — são derivados do aeródromo-alvo no service.
 */
export class CreateLandingRequestDTO {
  @ApiProperty({ format: 'uuid', description: 'Aeródromo de destino' })
  @IsUUID('4')
  aerodromeId!: string;

  @ApiProperty({ example: 'SBSP', description: 'ICAO do aeródromo de partida' })
  @Transform(upperIcao)
  @IsString()
  @Matches(/^[A-Z0-9]{4}$/, {
    message: 'Informe um código ICAO de partida com 4 caracteres.',
  })
  departureIcao!: string;

  @ApiProperty({ example: 'SBRJ', description: 'ICAO do próximo destino' })
  @Transform(upperIcao)
  @IsString()
  @Matches(/^[A-Z0-9]{4}$/, {
    message: 'Informe um código ICAO de destino com 4 caracteres.',
  })
  nextDestinationIcao!: string;

  @ApiProperty({
    example: '2026-07-10T12:00:00.000Z',
    description: 'Previsão de decolagem (UTC/Zulu)',
  })
  @Type(() => Date)
  @IsDate()
  departureAt!: Date;

  @ApiProperty({
    example: '2026-07-10T15:00:00.000Z',
    description: 'Previsão de pouso (UTC/Zulu)',
  })
  @Type(() => Date)
  @IsDate()
  landingAt!: Date;

  @ApiProperty({
    example: '2026-07-10T17:00:00.000Z',
    description: 'Previsão de saída após o pouso (UTC/Zulu)',
  })
  @Type(() => Date)
  @IsDate()
  exitAfterLandingAt!: Date;

  @ApiProperty({ example: 'Maria Souza', description: 'Nome do solicitante' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  requesterName!: string;

  @ApiProperty({ example: 'piloto@example.com' })
  @NormalizeEmail()
  @IsEmail()
  @MaxLength(320)
  email!: string;

  @ApiProperty({
    example: '+5511999999999',
    description: 'Telefone de contato em E.164 (com DDI)',
  })
  @NormalizeOptionalPhone()
  @IsNotEmpty({ message: 'Informe o telefone de contato.' })
  @IsE164Phone()
  @MaxLength(32)
  phoneContact!: string;

  @ApiProperty({ example: 'João da Silva', description: 'Nome do piloto' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  pilotName!: string;

  @ApiProperty({
    example: '12345678909',
    description: 'CPF do piloto (11 dígitos)',
  })
  @Transform(stripCpfDigits)
  @IsCpf()
  pilotCpf!: string;

  @ApiProperty({
    example: '204603',
    description: 'Código ANAC (CANAC, 6 dígitos)',
  })
  @IsString()
  @Matches(/^\d{6}$/, { message: 'O código ANAC deve ter 6 dígitos.' })
  anacPilotCode!: string;

  @ApiProperty({ example: 'PT-ABC', description: 'Matrícula da aeronave' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  aircraftRegistration!: string;

  @ApiPropertyOptional({
    default: false,
    description:
      'Marcar quando a matrícula for estrangeira (pula a checagem RAB)',
  })
  @IsOptional()
  @IsBoolean()
  foreignRegistration?: boolean;

  @ApiProperty({ example: 'Cessna 172', description: 'Modelo da aeronave' })
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  aircraftModel!: string;

  @ApiProperty({ example: 3, minimum: 1, maximum: 999 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(999)
  peopleOnBoard!: number;

  @ApiPropertyOptional({ maxLength: 2000, description: 'Observações livres' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @ApiProperty({
    description: 'Confirmação de veracidade das informações (deve ser true)',
  })
  @IsBoolean()
  @Equals(true, { message: 'Confirme a veracidade das informações.' })
  confirmedTrue!: boolean;

  @ApiProperty({ description: 'Aceite dos Termos de uso (deve ser true)' })
  @IsBoolean()
  @Equals(true, { message: 'É necessário aceitar os Termos de uso.' })
  acceptedTerms!: boolean;
}
