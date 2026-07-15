import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { FindVisibleAerodromeByIcaoDocs } from '../docs/find-visible-aerodrome-by-icao.docs';
import { AerodromeIcaoParamDTO } from '../dtos/aerodrome-icao-param.dto';
import { AerodromePublicResponseDTO } from '../dtos/aerodrome-public-response.dto';
import { FindVisibleAerodromeByIcaoService } from '../services/find-visible-aerodrome-by-icao.service';

/**
 * `GET /aerodromes/visible/:icao` — ficha pública (X-API-Key). Sem JWT/RBAC.
 * Precedência sobre `/:id`: ver `aerodromes.module.ts` / `.spec.ts`.
 */
@ApiTags('Aerodromes')
@Controller('aerodromes')
@UseGuards(AerobiApiKeyGuard)
export class FindVisibleAerodromeByIcaoController {
  constructor(private readonly service: FindVisibleAerodromeByIcaoService) {}

  @Get('visible/:icao')
  @FindVisibleAerodromeByIcaoDocs()
  handle(
    @Param() params: AerodromeIcaoParamDTO,
  ): Promise<AerodromePublicResponseDTO> {
    return this.service.execute({ icao: params.icao });
  }
}
