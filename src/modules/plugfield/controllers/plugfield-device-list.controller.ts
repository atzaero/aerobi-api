import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { PlugfieldApiKeyGuard } from '@/common/guards/plugfield-api-key.guard';

import { PlugfieldDeviceListDocs } from '../docs/plugfield-device-list.docs';
import { PlugfieldDeviceListQueryDto } from '../dtos/plugfield-device-list-query.dto';
import { PlugfieldDeviceListService } from '../services/plugfield-device-list.service';
import { readIncomingAuthorization } from '../utils/read-incoming-authorization.util';

@ApiTags('Plugfield')
@Controller('plugfield')
@UseGuards(PlugfieldApiKeyGuard)
export class PlugfieldDeviceListController {
  constructor(
    private readonly plugfieldDeviceList: PlugfieldDeviceListService,
  ) {}

  @Get('device')
  @PlugfieldDeviceListDocs()
  async handle(
    @Query() query: PlugfieldDeviceListQueryDto,
    @Req() req: Request,
  ): Promise<Record<string, unknown>[]> {
    const auth = readIncomingAuthorization(req);
    return this.plugfieldDeviceList.execute(
      {
        deviceId: query.deviceId,
        code: query.code,
      },
      auth,
    );
  }
}
