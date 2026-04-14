import { BadGatewayException, Injectable } from '@nestjs/common';

import type {
  PlugfieldDataResult,
  PlugfieldDataSensorQuery,
} from '../types/plugfield.types';
import { PlugfieldHttpService } from './plugfield-http.service';

/**
 * Proxy Plugfield `GET /data/sensor`.
 */
@Injectable()
export class PlugfieldDataSensorService {
  constructor(private readonly plugfieldHttp: PlugfieldHttpService) {}

  async execute(query: PlugfieldDataSensorQuery): Promise<PlugfieldDataResult> {
    const raw = await this.plugfieldHttp.requestJson({
      method: 'GET',
      path: '/data/sensor',
      query: {
        device: query.device,
        sensor: query.sensor,
        time: query.time,
        timeMax: query.timeMax,
        groupedBy: query.groupedBy,
      },
      useVendorAuthorization: true,
    });

    if (raw === null || raw === undefined) {
      throw new BadGatewayException(
        'Plugfield data endpoint returned an unexpected response shape',
      );
    }

    return raw as PlugfieldDataResult;
  }
}
