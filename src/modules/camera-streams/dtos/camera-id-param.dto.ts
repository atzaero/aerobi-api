import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

/**
 * Parâmetro de rota `:cameraId` — id da câmera no **Postgres** (UUID). Difere do
 * proxy legado (`streams`), onde o id era o doc id do Firestore: aqui é o
 * `Camera.id` (uuid v4) do módulo `cameras`. `@IsUUID` já barra path traversal
 * (`..`, `/`) ao montar a URL do mediamtx.
 */
export class CameraIdParamDTO {
  @ApiProperty({
    format: 'uuid',
    example: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
    description: 'Id (UUID) da câmera.',
  })
  @IsUUID()
  cameraId!: string;
}
