import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { PlugfieldApiKeyGuard } from '@/common/guards/plugfield-api-key.guard';

import { PlugfieldDataSensorDocs } from '../docs/plugfield-data-sensor.docs';
import { PlugfieldDataQueryDto } from '../dtos/plugfield-data-query.dto';
import type { PlugfieldDataResult } from '../types/plugfield.types';
import { PlugfieldDataSensorService } from '../services/plugfield-data-sensor.service';
import { readIncomingAuthorization } from '../utils/read-incoming-authorization.util';

@ApiTags('Plugfield')
@Controller('plugfield')
@UseGuards(PlugfieldApiKeyGuard)
export class PlugfieldDataSensorController {
  constructor(
    private readonly plugfieldDataSensor: PlugfieldDataSensorService,
  ) {}

  @Get('data/sensor')
  @PlugfieldDataSensorDocs()
  async handle(
    @Query() query: PlugfieldDataQueryDto,
    @Req() req: Request,
  ): Promise<PlugfieldDataResult> {
    const auth = readIncomingAuthorization(req);
    return this.plugfieldDataSensor.execute(
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
