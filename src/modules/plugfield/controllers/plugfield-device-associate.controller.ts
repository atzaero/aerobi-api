import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { PlugfieldApiKeyGuard } from '@/common/guards/plugfield-api-key.guard';

import { PlugfieldDeviceAssociateDocs } from '../docs/plugfield-device-associate.docs';
import { PlugfieldDeviceAssociateBodyDto } from '../dtos/plugfield-device-associate-body.dto';
import { PlugfieldDeviceAssociateService } from '../services/plugfield-device-associate.service';
import { readIncomingAuthorization } from '../utils/read-incoming-authorization.util';

@ApiTags('Plugfield')
@Controller('plugfield')
@UseGuards(PlugfieldApiKeyGuard)
export class PlugfieldDeviceAssociateController {
  constructor(
    private readonly plugfieldDeviceAssociate: PlugfieldDeviceAssociateService,
  ) {}

  @Post('device')
  @PlugfieldDeviceAssociateDocs()
  async handle(
    @Body() body: PlugfieldDeviceAssociateBodyDto,
    @Req() req: Request,
  ): Promise<Record<string, unknown>> {
    const auth = readIncomingAuthorization(req);
    return this.plugfieldDeviceAssociate.execute(
      {
        deviceId: body.deviceId,
        code: body.code,
      },
      auth,
    );
  }
}
