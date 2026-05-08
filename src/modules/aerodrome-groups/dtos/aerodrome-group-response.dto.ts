import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Uf } from '@/generated/prisma/client';

export class AerodromeGroupResponseDTO {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ enum: Uf })
  uf!: Uf;

  @ApiProperty()
  groupName!: string;

  @ApiPropertyOptional()
  ownerId!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Pedido de eliminação registado para o grupo',
    type: Boolean,
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

  @ApiPropertyOptional({
    nullable: true,
    type: String,
    format: 'date-time',
  })
  deletedAt!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  deletedBy!: string | null;
}
