import { ApiProperty } from '@nestjs/swagger';

/**
 * Resposta pública de uma câmera na listagem por aeródromo. Expõe **apenas** o
 * necessário para o player montar a URL do stream — `id`, `name`, `icao` e a
 * `streamUrl` (path relativo da playlist no próprio aerobi-api). **Não** vaza
 * `mediamtxNode`/`mediamtxPath` (topologia interna da tailnet).
 */
export class CameraResponseDTO {
  @ApiProperty({ example: 'aero-mvp-cam-1', description: 'Id da câmera.' })
  id!: string;

  @ApiProperty({ example: 'Pátio de aeronaves', description: 'Nome amigável.' })
  name!: string;

  @ApiProperty({ example: 'SBSP', description: 'ICAO do aeródromo.' })
  icao!: string;

  @ApiProperty({
    example: '/streams/aero-mvp-cam-1/index.m3u8',
    description: 'Path relativo da playlist HLS (proxy via aerobi-api).',
  })
  streamUrl!: string;
}
