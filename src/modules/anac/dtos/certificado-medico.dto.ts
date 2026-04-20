import { ApiProperty } from '@nestjs/swagger';

export class CertificadoMedicoDto {
  @ApiProperty({ example: '1ª Classe' })
  classe!: string;

  @ApiProperty({ example: '15/06/2025' })
  validade!: string;

  @ApiProperty({ example: 'ANAC' })
  orgao!: string;

  @ApiProperty({ example: 'Sem restrições' })
  observacoes!: string;
}
