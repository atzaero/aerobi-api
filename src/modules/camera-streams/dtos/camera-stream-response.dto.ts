import { ApiProperty } from '@nestjs/swagger';

/**
 * Resposta pública de uma câmera na listagem por aeródromo. Expõe **apenas** o
 * necessário para o player montar a URL do stream — `id`, `name`, `icao` e a
 * `streamUrl` (path relativo da playlist no próprio aerobi-api). **Não** vaza
 * `mediamtxNode`/`mediamtxPath` (topologia interna da tailnet).
 */
export class CameraStreamResponseDTO {
  @ApiProperty({
    format: 'uuid',
    example: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
    description: 'Id (UUID) da câmera.',
  })
  id!: string;

  @ApiProperty({ example: 'Pátio de aeronaves', description: 'Nome amigável.' })
  name!: string;

  @ApiProperty({ example: 'SBSP', description: 'ICAO do aeródromo.' })
  icao!: string;

  @ApiProperty({
    example: '/camera-streams/3f2504e0-4f89-41d3-9a0c-0305e82c3301/index.m3u8',
    description: 'Path relativo da playlist HLS (proxy via aerobi-api).',
  })
  streamUrl!: string;
}
