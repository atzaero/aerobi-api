import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

/**
 * Parâmetros da rota de segmento `GET /streams/:cameraId/:segment`.
 *
 * O `segment` é validado para ser um único componente de caminho terminando em
 * `.m4s`, `.mp4` ou `.m3u8` — cobre `init.mp4`, os segmentos fMP4 e também as
 * **playlists de variante** (ex.: `video1_stream.m3u8`) que o master playlist do
 * mediamtx referencia. Sem o `.m3u8` aqui, um stream multivariante (o default do
 * mediamtx em fMP4/LL-HLS) não toca: o player obtém o master por `index.m3u8`
 * mas a variante cairia nesta rota e seria rejeitada. O charset sem `/` nem `.`
 * no corpo impede path traversal (`..`, `/etc/...`) na URL do mediamtx.
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
    description:
      'Nome do segmento HLS (*.m4s, *.mp4, init.mp4) ou da playlist de ' +
      'variante (*.m3u8).',
  })
  @IsString()
  @Matches(/^[A-Za-z0-9_-]+\.(m4s|mp4|m3u8)$/, {
    message: 'segment deve ser um arquivo .m4s, .mp4 ou .m3u8.',
  })
  segment!: string;
}
