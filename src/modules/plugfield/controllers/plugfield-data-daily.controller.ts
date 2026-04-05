import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { PlugfieldApiKeyGuard } from '@/common/guards/plugfield-api-key.guard';

import { PlugfieldDataDailyDocs } from '../docs/plugfield-data-daily.docs';
import { PlugfieldDataQueryDto } from '../dtos/plugfield-data-query.dto';
import type { PlugfieldDataResult } from '../types/plugfield.types';
import { PlugfieldDataDailyService } from '../services/plugfield-data-daily.service';
import { readIncomingAuthorization } from '../utils/read-incoming-authorization.util';

@ApiTags('Plugfield')
@Controller('plugfield')
@UseGuards(PlugfieldApiKeyGuard)
export class PlugfieldDataDailyController {
  constructor(private readonly plugfieldDataDaily: PlugfieldDataDailyService) {}

  @Get('data/daily')
  @PlugfieldDataDailyDocs()
  async handle(
    @Query() query: PlugfieldDataQueryDto,
    @Req() req: Request,
  ): Promise<PlugfieldDataResult> {
    const auth = readIncomingAuthorization(req);
    return this.plugfieldDataDaily.execute(
      {
        sensorId: query.sensorId,
        deviceId: query.deviceId,
        startTime: query.startTime,
        endTime: query.endTime,
      },
      auth,
    );
  }
}
