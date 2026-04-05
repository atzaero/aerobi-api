import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { PlugfieldDeviceByIdDocs } from '../docs/plugfield-device-by-id.docs';
import { PlugfieldDeviceByIdService } from '../services/plugfield-device-by-id.service';

@ApiTags('Plugfield')
@Controller('plugfield')
@UseGuards(AerobiApiKeyGuard)
export class PlugfieldDeviceByIdController {
  constructor(
    private readonly plugfieldDeviceById: PlugfieldDeviceByIdService,
  ) {}

  @Get('device/:deviceId')
  @PlugfieldDeviceByIdDocs()
  async handle(
    @Param('deviceId') deviceId: string,
  ): Promise<Record<string, unknown>> {
    return this.plugfieldDeviceById.execute(deviceId);
  }
}
