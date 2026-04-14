import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { PlugfieldDataDailyDocs } from '../docs/plugfield-data-daily.docs';
import { PlugfieldDataDailyQueryDto } from '../dtos/plugfield-data-daily-query.dto';
import type { PlugfieldDataResult } from '../types/plugfield.types';
import { PlugfieldDataDailyService } from '../services/plugfield-data-daily.service';

@ApiTags('Plugfield')
@Controller('plugfield')
@UseGuards(AerobiApiKeyGuard)
export class PlugfieldDataDailyController {
  constructor(private readonly plugfieldDataDaily: PlugfieldDataDailyService) {}

  @Get('data/daily')
  @PlugfieldDataDailyDocs()
  async handle(
    @Query() query: PlugfieldDataDailyQueryDto,
  ): Promise<PlugfieldDataResult> {
    return this.plugfieldDataDaily.execute({
      device: query.device,
      begin: query.begin,
      end: query.end,
    });
  }
}
