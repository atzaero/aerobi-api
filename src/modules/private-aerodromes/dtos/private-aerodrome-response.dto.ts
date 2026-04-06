import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PrivateAerodromeResponseDTO {
  @ApiProperty()
  id: string;

  @ApiProperty({
    description: 'Código CIAD do aeródromo (identificador único)',
  })
  ciad: string;

  @ApiPropertyOptional({ description: 'Código OACI' })
  codigoOaci?: string | null;

  @ApiPropertyOptional()
  nome?: string | null;

  @ApiPropertyOptional()
  municipio?: string | null;

  @ApiPropertyOptional()
  uf?: string | null;

  @ApiPropertyOptional()
  longitude?: string | null;

  @ApiPropertyOptional()
  latitude?: string | null;

  @ApiPropertyOptional()
  altitude?: string | null;

  @ApiPropertyOptional()
  operacaoDiurna?: string | null;

  @ApiPropertyOptional()
  operacaoNoturna?: string | null;

  @ApiPropertyOptional()
  designacao1?: string | null;

  @ApiPropertyOptional()
  comprimento1?: string | null;

  @ApiPropertyOptional()
  largura1?: string | null;

  @ApiPropertyOptional()
  resistencia1?: string | null;

  @ApiPropertyOptional()
  superficie1?: string | null;

  @ApiPropertyOptional()
  designacao2?: string | null;

  @ApiPropertyOptional()
  comprimento2?: string | null;

  @ApiPropertyOptional()
  largura2?: string | null;

  @ApiPropertyOptional()
  resistencia2?: string | null;

  @ApiPropertyOptional()
  superficie2?: string | null;

  @ApiPropertyOptional()
  portariaRegistro?: string | null;

  @ApiPropertyOptional()
  linkPortaria?: string | null;

  @ApiPropertyOptional()
  latGeoPoint?: string | null;

  @ApiPropertyOptional()
  lonGeoPoint?: string | null;
}
