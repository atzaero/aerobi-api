import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class PlugfieldDataSensorQueryDto {
  @ApiProperty({ description: 'Id da estação (device).', example: 9133 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  device!: number;

  @ApiProperty({ description: 'Id do sensor.', example: 8 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  sensor!: number;

  @ApiPropertyOptional({
    description:
      'Timestamp em milissegundos — início do período. Se omitido, retorna leituras do último dia.',
    example: 1776142415000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  time?: number;

  @ApiPropertyOptional({
    description: 'Timestamp em milissegundos — fim do período.',
    example: 1776228815000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  timeMax?: number;

  @ApiPropertyOptional({
    description: "Agrupamento de dados: 'week', 'day' ou 'hour'.",
    example: 'day',
  })
  @IsOptional()
  @IsString()
  groupedBy?: string;
}
