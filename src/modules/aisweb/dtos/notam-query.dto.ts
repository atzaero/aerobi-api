import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class NotamQueryDto {
  @ApiPropertyOptional({
    enum: ['N', 'I'],
    description: 'Distribuição: N = nacional, I = internacional',
  })
  @IsOptional()
  @IsString()
  @IsIn(['N', 'I'])
  dist?: string;

  @ApiPropertyOptional({ description: 'Número do NOF' })
  @IsOptional()
  @IsString()
  nof?: string;

  @ApiPropertyOptional({ description: 'Série' })
  @IsOptional()
  @IsString()
  serie?: string;

  @ApiPropertyOptional({ description: 'Categoria' })
  @IsOptional()
  @IsString()
  categoria?: string;

  @ApiPropertyOptional({
    enum: ['N', 'C', 'R'],
    description: 'Status: N = novo, C = cancelado, R = reemplazado',
  })
  @IsOptional()
  @IsString()
  @IsIn(['N', 'C', 'R'])
  status?: string;

  @ApiPropertyOptional({ description: 'FIR (Flight Information Region)' })
  @IsOptional()
  @IsString()
  fir?: string;

  @ApiPropertyOptional({ description: 'Número do NOTAM' })
  @IsOptional()
  @IsString()
  nnotam?: string;

  @ApiPropertyOptional({ description: 'Ano' })
  @IsOptional()
  @IsString()
  ano?: string;

  @ApiPropertyOptional({ description: 'Data de referência' })
  @IsOptional()
  @IsString()
  dt_ref?: string;

  @ApiPropertyOptional({ description: 'Data' })
  @IsOptional()
  @IsString()
  dt?: string;

  @ApiPropertyOptional({ description: 'Todos' })
  @IsOptional()
  @IsString()
  all?: string;

  @ApiPropertyOptional({ description: 'Minutos' })
  @IsOptional()
  @IsString()
  minutes?: string;

  @ApiPropertyOptional({ description: 'Data início (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  dt_start?: string;

  @ApiPropertyOptional({ description: 'Data fim (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  dt_end?: string;

  @ApiPropertyOptional({
    description: 'Código ICAO do aeródromo',
    example: 'SBGR',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : undefined,
  )
  icaocode?: string;

  @ApiPropertyOptional({
    enum: ['N', 'R', 'C'],
    description: 'Tipo: N = NOTAM, R = SNOWTAM, C = BIRDTAM',
  })
  @IsOptional()
  @IsString()
  @IsIn(['N', 'R', 'C'])
  type?: string;
}
