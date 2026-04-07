import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ValidateIf,
} from 'class-validator';

export class SolQueryDto {
  @ApiProperty({ description: 'Código ICAO do aeródromo', example: 'SBGR' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : undefined,
  )
  icaoCode: string;

  @ApiPropertyOptional({
    description: 'Data início (YYYY-MM-DD)',
    example: '2026-04-06',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'dt_i must be YYYY-MM-DD' })
  dt_i?: string;

  @ApiPropertyOptional({
    description: 'Data fim (YYYY-MM-DD, obrigatório se dt_i informado)',
    example: '2026-04-07',
  })
  @ValidateIf((o: SolQueryDto) => o.dt_i != null)
  @IsString()
  @IsNotEmpty({ message: 'dt_f é obrigatório quando dt_i é informado' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'dt_f must be YYYY-MM-DD' })
  dt_f?: string;
}
