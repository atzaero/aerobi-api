import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { PlugfieldDataSensorDocs } from '../docs/plugfield-data-sensor.docs';
import { PlugfieldDataQueryDto } from '../dtos/plugfield-data-query.dto';
import type { PlugfieldDataResult } from '../types/plugfield.types';
import { PlugfieldDataSensorService } from '../services/plugfield-data-sensor.service';

@ApiTags('Plugfield')
@Controller('plugfield')
@UseGuards(AerobiApiKeyGuard)
export class PlugfieldDataSensorController {
  constructor(
    private readonly plugfieldDataSensor: PlugfieldDataSensorService,
  ) {}

  @Get('data/sensor')
  @PlugfieldDataSensorDocs()
  async handle(
    @Query() query: PlugfieldDataQueryDto,
  ): Promise<PlugfieldDataResult> {
    return this.plugfieldDataSensor.execute({
      sensorId: query.sensorId,
      deviceId: query.deviceId,
      startTime: query.startTime,
      endTime: query.endTime,
    });
  }
}
