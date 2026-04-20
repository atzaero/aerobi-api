import { ApiProperty } from '@nestjs/swagger';

export class LicenseDto {
  @ApiProperty({ example: 'Piloto Privado de Avião' })
  tipo!: string;

  @ApiProperty({ example: '15/06/2025' })
  validade!: string;

  @ApiProperty({ example: true })
  valida!: boolean;

  @ApiProperty({ example: false })
  emTolerancia!: boolean;
}
