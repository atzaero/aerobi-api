import { Injectable } from '@nestjs/common';

import { normalizePlugfieldDeviceList } from '../utils/normalize-plugfield-device-list.util';
import type { PlugfieldDeviceListQuery } from '../types/plugfield.types';
import { PlugfieldHttpService } from './plugfield-http.service';

/**
 * Proxy Plugfield `GET /device`.
 */
@Injectable()
export class PlugfieldDeviceListService {
  constructor(private readonly plugfieldHttp: PlugfieldHttpService) {}

  async execute(
    query: PlugfieldDeviceListQuery,
  ): Promise<Record<string, unknown>[]> {
    const raw = await this.plugfieldHttp.requestJson({
      method: 'GET',
      path: '/device',
      query: {
        deviceId: query.deviceId,
        code: query.code,
      },
      useVendorAuthorization: true,
    });

    const items = normalizePlugfieldDeviceList(raw);
    return items as Record<string, unknown>[];
  }
}
