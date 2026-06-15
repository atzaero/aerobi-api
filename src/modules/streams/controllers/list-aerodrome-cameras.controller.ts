import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { ListAerodromeCamerasDocs } from '../docs/list-aerodrome-cameras.docs';
import { AerodromeIcaoParamDTO } from '../dtos/aerodrome-icao-param.dto';
import { CameraResponseDTO } from '../dtos/camera-response.dto';
import { ListAerodromeCamerasService } from '../services/list-aerodrome-cameras.service';

/**
 * `GET /aerodromes/:icao/cameras` — lista as câmeras ativas de um aeródromo
 * lendo o Firestore. Protegida por `AerobiApiKeyGuard` (server-to-server: o BFF
 * Next.js detém a `X-API-Key`).
 */
@ApiTags('Streams')
@Controller('aerodromes/:icao/cameras')
@UseGuards(AerobiApiKeyGuard)
export class ListAerodromeCamerasController {
  constructor(private readonly service: ListAerodromeCamerasService) {}

  @Get()
  @ListAerodromeCamerasDocs()
  handle(@Param() params: AerodromeIcaoParamDTO): Promise<CameraResponseDTO[]> {
    return this.service.execute(params.icao);
  }
}
