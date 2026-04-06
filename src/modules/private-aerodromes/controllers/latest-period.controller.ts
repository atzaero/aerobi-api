import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { PrivateAerodromesLatestPeriodDocs } from '../docs/latest-period.docs';
import { PrivateAerodromesLatestPeriodService } from '../services/private-aerodromes-latest-period.service';

@ApiTags('Private Aerodromes')
@Controller('private-aerodromes')
@UseGuards(AerobiApiKeyGuard)
export class PrivateAerodromesLatestPeriodController {
  constructor(
    private readonly latestPeriod: PrivateAerodromesLatestPeriodService,
  ) {}

  @Get('latest-period')
  @PrivateAerodromesLatestPeriodDocs()
  async handle() {
    return this.latestPeriod.execute();
  }
}
