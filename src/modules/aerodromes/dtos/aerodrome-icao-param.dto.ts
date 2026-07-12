import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, Length, Matches } from 'class-validator';

/**
 * Parâmetro de rota `:icao` — código ICAO do aeródromo (4 caracteres
 * alfanuméricos), no mesmo formato de `Aerodrome.icao`. Aceita minúsculas e
 * normaliza para uppercase via `@Transform` (ValidationPipe com `transform`).
 */
export class AerodromeIcaoParamDTO {
  @ApiProperty({ example: 'SBSP', description: 'Código ICAO do aeródromo.' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @Length(4, 4)
  @Matches(/^[A-Za-z0-9]{4}$/, {
    message: 'icao deve ter 4 caracteres alfanuméricos (ex.: SBSP, SJ4E).',
  })
  icao!: string;
}
