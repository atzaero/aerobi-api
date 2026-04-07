import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class RotaerQueryDto {
  @ApiProperty({ description: 'Código ICAO do aeródromo', example: 'SBGR' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : undefined,
  )
  icaoCode: string;
}
