import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Uf } from '@/generated/prisma/client';

/**
 * Retorno do `POST /landing-requests` (envio público): apenas `id` e `uf`
 * (derivada do aeródromo-alvo) — espelha o retorno da action de create do
 * `aerobi-web`. Os demais campos ficam para a moderação interna.
 */
export class CreateLandingRequestResponseDTO {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiPropertyOptional({ enum: Uf, nullable: true })
  uf!: Uf | null;
}
