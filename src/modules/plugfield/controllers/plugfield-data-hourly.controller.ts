import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { PlugfieldDataHourlyDocs } from '../docs/plugfield-data-hourly.docs';
import { PlugfieldDataHourlyQueryDto } from '../dtos/plugfield-data-hourly-query.dto';
import type { PlugfieldDataResult } from '../types/plugfield.types';
import { PlugfieldDataHourlyService } from '../services/plugfield-data-hourly.service';

@ApiTags('Plugfield')
@Controller('plugfield')
@UseGuards(AerobiApiKeyGuard)
export class PlugfieldDataHourlyController {
  constructor(
    private readonly plugfieldDataHourly: PlugfieldDataHourlyService,
  ) {}

  @Get('data/hourly')
  @PlugfieldDataHourlyDocs()
  async handle(
    @Query() query: PlugfieldDataHourlyQueryDto,
  ): Promise<PlugfieldDataResult> {
    return this.plugfieldDataHourly.execute({
      device: query.device,
      begin: query.begin,
      end: query.end,
    });
  }
}
