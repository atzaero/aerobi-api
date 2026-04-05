import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class PlugfieldDataQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sensorId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deviceId?: string;

  @ApiPropertyOptional({
    description: 'Unix timestamp em milissegundos (início).',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  startTime?: number;

  @ApiPropertyOptional({
    description: 'Unix timestamp em milissegundos (fim).',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  endTime?: number;
}
