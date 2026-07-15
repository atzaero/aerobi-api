import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ListAerodromeCameraStreamsDocs } from '../docs/list-aerodrome-camera-streams.docs';
import { AerodromeIcaoParamDTO } from '../dtos/aerodrome-icao-param.dto';
import { CameraStreamResponseDTO } from '../dtos/camera-stream-response.dto';
import { ListAerodromeCameraStreamsService } from '../services/list-aerodrome-camera-streams.service';

/**
 * `GET /aerodromes/:icao/camera-streams` — lista as câmeras ativas de um
 * aeródromo lendo do Postgres (módulo `cameras`). **Pública** (acompanha o proxy
 * `/camera-streams/*`): só expõe `id`/`name`/`icao`/`streamUrl`, sem topologia da
 * tailnet. É a rota v2 (#473) que substitui a listagem legada
 * `/aerodromes/:icao/cameras` (Firestore).
 */
@ApiTags('Camera Streams')
@Controller('aerodromes/:icao/camera-streams')
export class ListAerodromeCameraStreamsController {
  constructor(private readonly service: ListAerodromeCameraStreamsService) {}

  @Get()
  @ListAerodromeCameraStreamsDocs()
  handle(
    @Param() params: AerodromeIcaoParamDTO,
  ): Promise<CameraStreamResponseDTO[]> {
    return this.service.execute(params.icao);
  }
}
