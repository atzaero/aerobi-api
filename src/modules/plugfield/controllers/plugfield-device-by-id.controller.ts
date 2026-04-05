import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { PlugfieldApiKeyGuard } from '@/common/guards/plugfield-api-key.guard';

import { PlugfieldDeviceByIdDocs } from '../docs/plugfield-device-by-id.docs';
import { PlugfieldDeviceByIdService } from '../services/plugfield-device-by-id.service';
import { readIncomingAuthorization } from '../utils/read-incoming-authorization.util';

@ApiTags('Plugfield')
@Controller('plugfield')
@UseGuards(PlugfieldApiKeyGuard)
export class PlugfieldDeviceByIdController {
  constructor(
    private readonly plugfieldDeviceById: PlugfieldDeviceByIdService,
  ) {}

  @Get('device/:deviceId')
  @PlugfieldDeviceByIdDocs()
  async handle(
    @Param('deviceId') deviceId: string,
    @Req() req: Request,
  ): Promise<Record<string, unknown>> {
    const auth = readIncomingAuthorization(req);
    return this.plugfieldDeviceById.execute(deviceId, auth);
  }
}
