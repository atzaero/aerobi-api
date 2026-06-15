import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

/**
 * Parâmetro de rota `:icao` — código ICAO do aeródromo (4 letras), no mesmo
 * formato de `Movement.aerodrome`. Aceita minúsculas; o service normaliza.
 */
export class AerodromeIcaoParamDTO {
  @ApiProperty({ example: 'SBSP', description: 'Código ICAO do aeródromo.' })
  @IsString()
  @Length(4, 4)
  @Matches(/^[A-Za-z]{4}$/, {
    message: 'icao deve ter 4 letras (ex.: SBSP).',
  })
  icao!: string;
}
