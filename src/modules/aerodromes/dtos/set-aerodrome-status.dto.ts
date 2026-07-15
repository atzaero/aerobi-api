import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn } from 'class-validator';

/**
 * Campos booleanos alternáveis pelo set-status — espelha `AERODROME_STATUS_FIELDS`
 * do `aerobi-web` (`is_open`/`is_view`/`weather_station_display`/`lit`), aqui em
 * camelCase (nomes das colunas Prisma). `fueling` **não** é alternável por aqui,
 * por paridade com a tela legada.
 */
export const AERODROME_STATUS_FIELDS = [
  'isOpen',
  'isView',
  'weatherStationDisplay',
  'lit',
] as const;

export type AerodromeStatusField = (typeof AERODROME_STATUS_FIELDS)[number];

/**
 * Alternância de um único campo de status. Espelha o `set-status` do web:
 * atualiza apenas o campo informado.
 */
export class SetAerodromeStatusDTO {
  @ApiProperty({ enum: AERODROME_STATUS_FIELDS, example: 'isOpen' })
  @IsIn(AERODROME_STATUS_FIELDS, {
    message: 'field deve ser um de: isOpen, isView, weatherStationDisplay, lit',
  })
  field!: AerodromeStatusField;

  @ApiProperty({ example: false })
  @IsBoolean()
  value!: boolean;
}
