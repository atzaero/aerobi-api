import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { PlugfieldApiKeyGuard } from '@/common/guards/plugfield-api-key.guard';

import {
  PlugfieldDeviceAssociateDocs,
  PlugfieldDeviceListDocs,
} from '../docs/plugfield-device.docs';
import { PlugfieldDeviceAssociateBodyDto } from '../dtos/plugfield-device-associate-body.dto';
import { PlugfieldDeviceListQueryDto } from '../dtos/plugfield-device-list-query.dto';
import { PlugfieldDeviceService } from '../services/plugfield-device.service';
import { readIncomingAuthorization } from '../utils/read-incoming-authorization.util';

@ApiTags('Plugfield')
@Controller('plugfield')
@UseGuards(PlugfieldApiKeyGuard)
export class PlugfieldDeviceController {
  constructor(private readonly plugfieldDevice: PlugfieldDeviceService) {}

  @Get('device')
  @PlugfieldDeviceListDocs()
  async list(
    @Query() query: PlugfieldDeviceListQueryDto,
    @Req() req: Request,
  ): Promise<Record<string, unknown>[]> {
    const auth = readIncomingAuthorization(req);
    return this.plugfieldDevice.listDevices(
      {
        deviceId: query.deviceId,
        code: query.code,
      },
      auth,
    );
  }

  @Post('device')
  @PlugfieldDeviceAssociateDocs()
  async associate(
    @Body() body: PlugfieldDeviceAssociateBodyDto,
    @Req() req: Request,
  ): Promise<Record<string, unknown>> {
    const auth = readIncomingAuthorization(req);
    return this.plugfieldDevice.associateDevice(
      {
        deviceId: body.deviceId,
        code: body.code,
      },
      auth,
    );
  }
}
