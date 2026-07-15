import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

/**
 * Parâmetro de rota `:cameraId` — id do documento da câmera no Firestore.
 *
 * Restringe a um charset seguro (`[A-Za-z0-9_-]`) tanto para casar com ids
 * gerados pelo Firestore quanto para impedir path traversal ao montar a URL do
 * mediamtx no proxy.
 */
export class CameraIdParamDTO {
  @ApiProperty({ example: 'aero-mvp-cam-1', description: 'Id da câmera.' })
  @IsString()
  @Matches(/^[A-Za-z0-9_-]{1,128}$/, {
    message: 'cameraId inválido.',
  })
  cameraId!: string;
}
