import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { LatestPeriodDocs } from '../docs/latest-period.docs';
import { AnacIndexService } from '../services/anac-index.service';

@ApiTags('RAB')
@Controller('rab')
@UseGuards(AerobiApiKeyGuard)
export class LatestPeriodController {
  constructor(private readonly index: AnacIndexService) {}

  @Get('latest-period')
  @LatestPeriodDocs()
  async handle() {
    const period = await this.index.execute();
    return { period };
  }
}
