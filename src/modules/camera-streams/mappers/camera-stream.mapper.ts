import type { CameraStreamSource } from '@/modules/cameras/types/camera-stream-source';

import { CameraStreamResponseDTO } from '../dtos/camera-stream-response.dto';

/**
 * Projeta um {@link CameraStreamSource} (Postgres, via `CameraQueryService`) na
 * resposta pública. Descarta `mediamtxNode`/`mediamtxPath` (topologia da
 * tailnet) e deriva a `streamUrl` da playlist HLS deste proxy.
 */
export class CameraStreamMapper {
  static toResponse(camera: CameraStreamSource): CameraStreamResponseDTO {
    return {
      id: camera.id,
      name: camera.name,
      icao: camera.icao,
      streamUrl: `/camera-streams/${camera.id}/index.m3u8`,
    };
  }
}
