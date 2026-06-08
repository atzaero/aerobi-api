import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

/**
 * Corpo do `POST /readings` (multipart/form-data) — campos em **snake_case**
 * por compatibilidade com o cliente Python (aviascan-cv). Todos os campos
 * chegam como string no multipart; `reading_datetime` é convertido para `Date`.
 * A imagem (`image`) é recebida à parte via `FileInterceptor`.
 */
export class CreateAircraftReadingDTO {
  @ApiProperty({ example: 'PR-ZTT', description: 'Matrícula lida por OCR.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(16)
  registration!: string;

  @ApiProperty({
    example: '0.98',
    description: 'Confiança da leitura (string, fiel ao OCR).',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  confidence!: string;

  @ApiProperty({
    example: '2026-06-08T16:52:39Z',
    description: 'Data/hora da leitura (ISO 8601).',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? new Date(value) : (value as Date),
  )
  @IsDate()
  reading_datetime!: Date;

  @ApiPropertyOptional({
    example: 'SSCF',
    description: 'Código ICAO do aeródromo.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(16)
  aerodrome?: string;

  @ApiPropertyOptional({
    description: 'Status de validação (null = não validada).',
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  reading_status?: string;

  @ApiPropertyOptional({ description: 'Identificador do revisor.' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  revisor_id?: string;

  @ApiPropertyOptional({ description: 'Comentários do revisor.' })
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  comments?: string;
}
