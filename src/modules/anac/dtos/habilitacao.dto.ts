import { ApiProperty } from '@nestjs/swagger';

export class HabilitacaoDto {
  @ApiProperty({ example: 'PHA' })
  tipo!: string;

  @ApiProperty({ example: '15/06/2025' })
  validade!: string;

  @ApiProperty({ example: 'Comandante' })
  funcao!: string;

  @ApiProperty({ example: 'VÁLIDA' })
  situacao!: string;
}
