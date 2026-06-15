import { CameraResponseDTO } from '../dtos/camera-response.dto';
import type { Camera } from '../types/camera';

/** Projeta uma {@link Camera} (Firestore) na resposta pública da API. */
export class CameraMapper {
  static toResponse(camera: Camera): CameraResponseDTO {
    return {
      id: camera.id,
      name: camera.name,
      icao: camera.icao,
      streamUrl: `/streams/${camera.id}/index.m3u8`,
    };
  }
}
