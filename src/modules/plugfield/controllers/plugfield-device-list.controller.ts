import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { PlugfieldDeviceListDocs } from '../docs/plugfield-device-list.docs';
import { PlugfieldDeviceListQueryDto } from '../dtos/plugfield-device-list-query.dto';
import { PlugfieldDeviceListService } from '../services/plugfield-device-list.service';

@ApiTags('Plugfield')
@Controller('plugfield')
@UseGuards(AerobiApiKeyGuard)
export class PlugfieldDeviceListController {
  constructor(
    private readonly plugfieldDeviceList: PlugfieldDeviceListService,
  ) {}

  @Get('device')
  @PlugfieldDeviceListDocs()
  async handle(
    @Query() query: PlugfieldDeviceListQueryDto,
  ): Promise<Record<string, unknown>[]> {
    return this.plugfieldDeviceList.execute({
      deviceId: query.deviceId,
      code: query.code,
    });
  }
}
