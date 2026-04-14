import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsString, Min } from 'class-validator';

export class PlugfieldDataDailyQueryDto {
  @ApiProperty({ description: 'Id da estação (device).', example: 9133 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  device!: number;

  @ApiProperty({
    description: 'Data de início (formato dd/MM/yyyy).',
    example: '01/04/2026',
  })
  @IsString()
  begin!: string;

  @ApiProperty({
    description: 'Data final (formato dd/MM/yyyy). Máximo 30 dias após begin.',
    example: '14/04/2026',
  })
  @IsString()
  end!: string;
}
