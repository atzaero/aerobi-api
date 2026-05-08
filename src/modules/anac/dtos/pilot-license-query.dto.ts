import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class PilotLicenseQueryDto {
  @ApiProperty({
    example: '856.859.259-72',
    description: 'CPF do piloto (com ou sem formatação)',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : '',
  )
  cpf!: string;

  @ApiProperty({
    example: '204603',
    description: 'Código ANAC do piloto',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : '',
  )
  canac!: string;
}
