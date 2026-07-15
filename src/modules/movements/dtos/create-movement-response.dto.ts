import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Resposta do `POST /readings`. Mantém o shape do aviascan-api legado
 * (`{ id, message, image_path }`) para não quebrar clientes existentes; o
 * `image_path` agora é uma presigned URL temporária (ou `null` sem imagem).
 */
export class CreateMovementResponseDTO {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Reading created successfully' })
  message!: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'Presigned URL da imagem (expira em ~1h) ou null.',
  })
  image_path!: string | null;
}
