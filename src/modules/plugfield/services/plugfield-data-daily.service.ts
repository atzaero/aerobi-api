import { BadGatewayException, Injectable } from '@nestjs/common';

import type {
  PlugfieldDataDailyQuery,
  PlugfieldDataResult,
} from '../types/plugfield.types';
import { PlugfieldHttpService } from './plugfield-http.service';

/**
 * Proxy Plugfield `GET /data/daily`.
 */
@Injectable()
export class PlugfieldDataDailyService {
  constructor(private readonly plugfieldHttp: PlugfieldHttpService) {}

  async execute(query: PlugfieldDataDailyQuery): Promise<PlugfieldDataResult> {
    const raw = await this.plugfieldHttp.requestJson({
      method: 'GET',
      path: '/data/daily',
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
