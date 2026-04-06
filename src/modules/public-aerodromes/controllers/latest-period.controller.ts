import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { PublicAerodromesLatestPeriodDocs } from '../docs/latest-period.docs';
import { PublicAerodromesLatestPeriodService } from '../services/public-aerodromes-latest-period.service';

@ApiTags('Public Aerodromes')
@Controller('public-aerodromes')
@UseGuards(AerobiApiKeyGuard)
export class PublicAerodromesLatestPeriodController {
  constructor(
    private readonly latestPeriod: PublicAerodromesLatestPeriodService,
  ) {}

  @Get('latest-period')
  @PublicAerodromesLatestPeriodDocs()
  async handle() {
    return this.latestPeriod.execute();
  }
}
