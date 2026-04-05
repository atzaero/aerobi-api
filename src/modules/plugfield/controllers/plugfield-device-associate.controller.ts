import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { PlugfieldDeviceAssociateDocs } from '../docs/plugfield-device-associate.docs';
import { PlugfieldDeviceAssociateBodyDto } from '../dtos/plugfield-device-associate-body.dto';
import { PlugfieldDeviceAssociateService } from '../services/plugfield-device-associate.service';

@ApiTags('Plugfield')
@Controller('plugfield')
@UseGuards(AerobiApiKeyGuard)
export class PlugfieldDeviceAssociateController {
  constructor(
    private readonly plugfieldDeviceAssociate: PlugfieldDeviceAssociateService,
  ) {}

  @Post('device')
  @PlugfieldDeviceAssociateDocs()
  async handle(
    @Body() body: PlugfieldDeviceAssociateBodyDto,
  ): Promise<Record<string, unknown>> {
    return this.plugfieldDeviceAssociate.execute({
      deviceId: body.deviceId,
      code: body.code,
    });
  }
}
