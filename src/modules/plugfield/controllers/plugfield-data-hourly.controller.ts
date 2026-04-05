import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { PlugfieldApiKeyGuard } from '@/common/guards/plugfield-api-key.guard';

import { PlugfieldDataHourlyDocs } from '../docs/plugfield-data-hourly.docs';
import { PlugfieldDataQueryDto } from '../dtos/plugfield-data-query.dto';
import type { PlugfieldDataResult } from '../types/plugfield.types';
import { PlugfieldDataHourlyService } from '../services/plugfield-data-hourly.service';
import { readIncomingAuthorization } from '../utils/read-incoming-authorization.util';

@ApiTags('Plugfield')
@Controller('plugfield')
@UseGuards(PlugfieldApiKeyGuard)
export class PlugfieldDataHourlyController {
  constructor(
    private readonly plugfieldDataHourly: PlugfieldDataHourlyService,
  ) {}

  @Get('data/hourly')
  @PlugfieldDataHourlyDocs()
  async handle(
    @Query() query: PlugfieldDataQueryDto,
    @Req() req: Request,
  ): Promise<PlugfieldDataResult> {
    const auth = readIncomingAuthorization(req);
    return this.plugfieldDataHourly.execute(
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
