import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { PlugfieldApiKeyGuard } from '@/common/guards/plugfield-api-key.guard';

import {
  PlugfieldDataDailyDocs,
  PlugfieldDataHourlyDocs,
  PlugfieldDataSensorDocs,
} from '../docs/plugfield-data.docs';
import { PlugfieldDataQueryDto } from '../dtos/plugfield-data-query.dto';
import {
  PlugfieldDataResult,
  PlugfieldDataService,
} from '../services/plugfield-data.service';
import { readIncomingAuthorization } from '../utils/read-incoming-authorization.util';

@ApiTags('Plugfield')
@Controller('plugfield')
@UseGuards(PlugfieldApiKeyGuard)
export class PlugfieldDataController {
  constructor(private readonly plugfieldData: PlugfieldDataService) {}

  @Get('data/daily')
  @PlugfieldDataDailyDocs()
  async daily(
    @Query() query: PlugfieldDataQueryDto,
    @Req() req: Request,
  ): Promise<PlugfieldDataResult> {
    const auth = readIncomingAuthorization(req);
    return this.plugfieldData.getDaily(
      {
        sensorId: query.sensorId,
        deviceId: query.deviceId,
        startTime: query.startTime,
        endTime: query.endTime,
      },
      auth,
    );
  }

  @Get('data/hourly')
  @PlugfieldDataHourlyDocs()
  async hourly(
    @Query() query: PlugfieldDataQueryDto,
    @Req() req: Request,
  ): Promise<PlugfieldDataResult> {
    const auth = readIncomingAuthorization(req);
    return this.plugfieldData.getHourly(
      {
        sensorId: query.sensorId,
        deviceId: query.deviceId,
        startTime: query.startTime,
        endTime: query.endTime,
      },
      auth,
    );
  }

  @Get('data/sensor')
  @PlugfieldDataSensorDocs()
  async sensor(
    @Query() query: PlugfieldDataQueryDto,
    @Req() req: Request,
  ): Promise<PlugfieldDataResult> {
    const auth = readIncomingAuthorization(req);
    return this.plugfieldData.getSensor(
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
