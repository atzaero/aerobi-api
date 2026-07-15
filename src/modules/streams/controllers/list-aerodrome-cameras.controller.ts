import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ListAerodromeCamerasDocs } from '../docs/list-aerodrome-cameras.docs';
import { AerodromeIcaoParamDTO } from '../dtos/aerodrome-icao-param.dto';
import { CameraResponseDTO } from '../dtos/camera-response.dto';
import { ListAerodromeCamerasService } from '../services/list-aerodrome-cameras.service';

/**
 * `GET /aerodromes/:icao/cameras` — lista as câmeras ativas de um aeródromo
 * lendo o Firestore. **Pública** (acompanha o proxy `/streams/*`): só expõe
 * `id`/`name`/`icao`/`streamUrl`, sem topologia da tailnet nem dados sensíveis.
 */
@ApiTags('Streams')
@Controller('aerodromes/:icao/cameras')
export class ListAerodromeCamerasController {
  constructor(private readonly service: ListAerodromeCamerasService) {}

  @Get()
  @ListAerodromeCamerasDocs()
  handle(@Param() params: AerodromeIcaoParamDTO): Promise<CameraResponseDTO[]> {
    return this.service.execute(params.icao);
  }
}
