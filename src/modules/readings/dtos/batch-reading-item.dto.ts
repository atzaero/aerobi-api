import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';

import { CreateAircraftReadingDTO } from './create-aircraft-reading.dto';

/**
 * Um item do array `metadata` do `POST /readings/batch`. Herda os campos (e a
 * validação) do create single e adiciona `image_index`, que referencia — por
 * índice 0-based — o arquivo correspondente em `images[]`. Itens sem
 * `image_index` são leituras sem imagem.
 */
export class BatchReadingItemDTO extends CreateAircraftReadingDTO {
  @ApiPropertyOptional({
    description: 'Índice (0-based) do arquivo em images[] desta leitura.',
    example: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  image_index?: number;
}
