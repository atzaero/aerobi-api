import { ApiProperty } from '@nestjs/swagger';

/**
 * Proprietário da aeronave (RAB) já normalizado em objeto tipado para o detalhe
 * `GET /movements/:id`. Cada campo é fiel à origem RAB (`String | null`) — os
 * documentos podem vir parcialmente mascarados (ex.: `231XXXXXX68`) e o valor é
 * preservado tal como recebido.
 */
export class RabProprietarioDTO {
  @ApiProperty({ type: String, nullable: true, example: 'FULANO DE TAL' })
  NOME!: string | null;

  @ApiProperty({ type: String, nullable: true, example: '231XXXXXX68' })
  DOCUMENTO!: string | null;

  @ApiProperty({ type: String, nullable: true, example: '100.00' })
  PERCENTUAL!: string | null;

  @ApiProperty({ type: String, nullable: true, example: 'PR' })
  UF!: string | null;
}

/**
 * Operador da aeronave (RAB) já normalizado em objeto tipado para o detalhe
 * `GET /movements/:id`. Cada campo é fiel à origem RAB (`String | null`) — os
 * documentos podem vir parcialmente mascarados (ex.: `231XXXXXX68`) e o valor é
 * preservado tal como recebido.
 */
export class RabOperadorDTO {
  @ApiProperty({ type: String, nullable: true, example: 'FULANO DE TAL' })
  NOME!: string | null;

  @ApiProperty({ type: String, nullable: true, example: '231XXXXXX68' })
  DOCUMENTO!: string | null;

  @ApiProperty({ type: String, nullable: true, example: 'N' })
  OPERACAO135!: string | null;

  @ApiProperty({ type: String, nullable: true, example: 'N' })
  TRANSPREGULAR135!: string | null;

  @ApiProperty({ type: String, nullable: true, example: 'N' })
  AUTORIZACAOPMAC135!: string | null;

  @ApiProperty({ type: String, nullable: true, example: 'N' })
  OPERACAO121!: string | null;

  @ApiProperty({ type: String, nullable: true, example: 'N' })
  TRANSPREGULAR121!: string | null;

  @ApiProperty({ type: String, nullable: true, example: 'N' })
  AUTORIZACAOPMAC121!: string | null;

  @ApiProperty({ type: String, nullable: true, example: 'N' })
  SAE!: string | null;

  @ApiProperty({ type: String, nullable: true, example: 'N' })
  AUTHISTRUT!: string | null;

  @ApiProperty({ type: String, nullable: true, example: 'PR' })
  UF!: string | null;
}
