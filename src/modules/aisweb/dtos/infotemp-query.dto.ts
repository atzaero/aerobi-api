import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class InfotempQueryDto {
  @ApiPropertyOptional({
    description: 'Código ICAO do aeródromo',
    example: 'SBGR',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : undefined,
  )
  icaoCode?: string;

  @ApiPropertyOptional({ description: 'Número do INFOTEMP', example: '1' })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : undefined,
  )
  number?: string;

  @ApiPropertyOptional({
    description: 'Status (0–4)',
    example: 0,
    minimum: 0,
    maximum: 4,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(4)
  status?: number;

  @ApiPropertyOptional({
    description: 'Filtro dist (N = nacional, I = internacional)',
    enum: ['N', 'I'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['N', 'I'])
  dist?: string;
}
