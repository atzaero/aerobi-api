import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsString, Min } from 'class-validator';

export class PlugfieldDataHourlyQueryDto {
  @ApiProperty({ description: 'Id da estação (device).', example: 9133 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  device!: number;

  @ApiProperty({
    description: 'Data/hora de início (formato dd/MM/yyyy HH).',
    example: '01/04/2026 08',
  })
  @IsString()
  begin!: string;

  @ApiProperty({
    description:
      'Data/hora final (formato dd/MM/yyyy HH). Máximo 30 dias após begin.',
    example: '14/04/2026 20',
  })
  @IsString()
  end!: string;
}
