import { ApiProperty } from '@nestjs/swagger';

/**
 * Item de leitura (reading) retornado pelo upstream AviaScan.
 * Usado apenas para documentação Swagger — o proxy devolve o JSON do upstream.
 */
export class AviascanReadingDto {
  @ApiProperty({ example: 6825 })
  id: number;

  @ApiProperty({ example: 'PU-OLS' })
  registration: string;

  @ApiProperty({ example: '0.98' })
  confidence: string;

  @ApiProperty({ example: '2026-05-29T16:52:39.000Z' })
  reading_datetime: string;

  @ApiProperty({ nullable: true, example: null })
  reading_status: string | null;

  @ApiProperty({ nullable: true, example: null })
  revisor_id: number | null;

  @ApiProperty({
    nullable: true,
    description:
      'URL absoluta da imagem — a Aerobi completa o caminho relativo do upstream com a base URL da AviaScan.',
    example:
      'https://aviascanapi.lmpierin.com.br/uploads/e35d1054-ef33-4851-a621-e2f7fc7ede81.jpg',
  })
  image_path: string | null;

  @ApiProperty({ nullable: true, example: null })
  comments: string | null;

  @ApiProperty({ example: 'SSCF' })
  aerodrome: string;
}
