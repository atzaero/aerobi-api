import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RabApiKeyGuard } from '@/common/guards/rab-api-key.guard';

import { LatestPeriodDocs } from '../docs/latest-period.docs';
import { AnacIndexService } from '../services/anac-index.service';

@ApiTags('RAB')
@Controller('rab')
@UseGuards(RabApiKeyGuard)
export class LatestPeriodController {
  constructor(private readonly index: AnacIndexService) {}

  @Get('latest-period')
  @LatestPeriodDocs()
  async handle() {
    const period = await this.index.execute();
    return { period };
  }
}
