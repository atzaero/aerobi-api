import { Injectable } from '@nestjs/common';

import { CameraQueryService } from '@/modules/cameras/services/camera-query.service';

import { CameraStreamResponseDTO } from '../dtos/camera-stream-response.dto';
import { CameraStreamMapper } from '../mappers/camera-stream.mapper';

/**
 * Lista as câmeras **publicáveis** (ativas e ligadas) de um aeródromo por ICAO,
 * lendo do Postgres via {@link CameraQueryService}. Cada item traz a `streamUrl`
 * (path relativo da playlist HLS deste proxy). Falha ao ler o Postgres é
 * dependência interna → propaga como 500 (`AllExceptionsFilter`).
 */
@Injectable()
export class ListAerodromeCameraStreamsService {
  constructor(private readonly cameraQuery: CameraQueryService) {}

  async execute(icao: string): Promise<CameraStreamResponseDTO[]> {
    const cameras = await this.cameraQuery.findEnabledByIcao(icao);
    return cameras.map((camera) => CameraStreamMapper.toResponse(camera));
  }
}
