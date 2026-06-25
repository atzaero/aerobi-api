import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Uf } from '@/generated/prisma/client';

export class AerodromeGroupResponseDTO {
  @ApiProperty({
    format: 'uuid',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  id!: string;

  @ApiProperty({ enum: Uf, example: Uf.SP })
  uf!: Uf;

  @ApiProperty({ example: 'Interior SP' })
  name!: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description:
      'URL presigned (temporária) da imagem ativa do grupo, resolvida ' +
      'best-effort a partir da key. `null` se não há imagem ou a assinatura falhou.',
    example: null,
  })
  imageUrl!: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'Identificador do proprietário (legado Firebase owner).',
    example: null,
  })
  ownerId!: string | null;

  @ApiPropertyOptional({
    type: Boolean,
    nullable: true,
    description: 'Pedido de eliminação registado para o grupo.',
    example: false,
  })
  deletionRequested!: boolean | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  createdBy!: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  updatedBy!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true, format: 'date-time' })
  deletedAt!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  deletedBy!: string | null;
}
