import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { ListVisibleAerodromesDocs } from '../docs/list-visible-aerodromes.docs';
import { AerodromePublicResponseDTO } from '../dtos/aerodrome-public-response.dto';
import { ListVisibleAerodromesService } from '../services/list-visible-aerodromes.service';

/**
 * `GET /aerodromes/visible` — mapa público (X-API-Key). Sem JWT/RBAC.
 * Precedência sobre `/:id`: ver `aerodromes.module.ts` / `.spec.ts`.
 */
@ApiTags('Aerodromes')
@Controller('aerodromes')
@UseGuards(AerobiApiKeyGuard)
export class ListVisibleAerodromesController {
  constructor(private readonly service: ListVisibleAerodromesService) {}

  @Get('visible')
  @ListVisibleAerodromesDocs()
  handle(): Promise<AerodromePublicResponseDTO[]> {
    return this.service.execute();
  }
}
