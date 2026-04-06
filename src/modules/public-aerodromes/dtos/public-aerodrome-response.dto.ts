import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PublicAerodromeResponseDTO {
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

  @ApiPropertyOptional({ description: 'Município servido pelo aeródromo' })
  municipioServido?: string | null;

  @ApiPropertyOptional({ description: 'UF do município servido' })
  ufServido?: string | null;

  @ApiPropertyOptional()
  latitude?: string | null;

  @ApiPropertyOptional()
  longitude?: string | null;

  @ApiPropertyOptional()
  altitude?: string | null;

  @ApiPropertyOptional()
  operacaoDiurna?: string | null;

  @ApiPropertyOptional()
  operacaoNoturna?: string | null;

  @ApiPropertyOptional({ description: 'Situação do aeródromo' })
  situacao?: string | null;

  @ApiPropertyOptional({ description: 'Validade do registro' })
  validadeRegistro?: string | null;

  @ApiPropertyOptional()
  portariaRegistro?: string | null;

  @ApiPropertyOptional()
  linkPortaria?: string | null;

  @ApiPropertyOptional()
  latGeoPoint?: string | null;

  @ApiPropertyOptional()
  lonGeoPoint?: string | null;
}
