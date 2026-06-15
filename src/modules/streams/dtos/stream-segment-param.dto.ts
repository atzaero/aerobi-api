import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

/**
 * Parâmetros da rota de segmento `GET /streams/:cameraId/:segment`.
 *
 * O `segment` é validado para ser um único componente de caminho terminando em
 * `.m4s` ou `.mp4` (cobre `init.mp4` e os segmentos fMP4). O charset sem `/`
 * nem `.` no corpo impede path traversal (`..`, `/etc/...`) na URL do mediamtx.
 */
export class StreamSegmentParamDTO {
  @ApiProperty({ example: 'aero-mvp-cam-1', description: 'Id da câmera.' })
  @IsString()
  @Matches(/^[A-Za-z0-9_-]{1,128}$/, {
    message: 'cameraId inválido.',
  })
  cameraId!: string;

  @ApiProperty({
    example: 'seg7.m4s',
    description: 'Nome do segmento HLS (*.m4s, *.mp4 ou init.mp4).',
  })
  @IsString()
  @Matches(/^[A-Za-z0-9_-]+\.(m4s|mp4)$/, {
    message: 'segment deve ser um arquivo .m4s ou .mp4.',
  })
  segment!: string;
}
