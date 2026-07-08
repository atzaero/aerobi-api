import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

/**
 * Parâmetro de rota `:icao` — código ICAO do aeródromo (4 caracteres
 * alfanuméricos), no mesmo formato de `Aerodrome.icao`. A maioria dos aeródromos
 * pequenos usa códigos com dígitos (ex.: `SJ4E`, `SI63`). Aceita minúsculas; o
 * service normaliza para uppercase.
 */
export class AerodromeIcaoParamDTO {
  @ApiProperty({ example: 'SBSP', description: 'Código ICAO do aeródromo.' })
  @IsString()
  @Length(4, 4)
  @Matches(/^[A-Za-z0-9]{4}$/, {
    message: 'icao deve ter 4 caracteres alfanuméricos (ex.: SBSP, SJ4E).',
  })
  icao!: string;
}
