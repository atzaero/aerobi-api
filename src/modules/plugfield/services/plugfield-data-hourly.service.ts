import { BadGatewayException, Injectable } from '@nestjs/common';

import type {
  PlugfieldDataHourlyQuery,
  PlugfieldDataResult,
} from '../types/plugfield.types';
import { PlugfieldHttpService } from './plugfield-http.service';

/**
 * Proxy Plugfield `GET /data/hourly`.
 */
@Injectable()
export class PlugfieldDataHourlyService {
  constructor(private readonly plugfieldHttp: PlugfieldHttpService) {}

  async execute(query: PlugfieldDataHourlyQuery): Promise<PlugfieldDataResult> {
    const raw = await this.plugfieldHttp.requestJson({
      method: 'GET',
      path: '/data/hourly',
      query: {
        device: query.device,
        begin: query.begin,
        end: query.end,
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
