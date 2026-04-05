import { Injectable } from '@nestjs/common';

import type {
  PlugfieldDataQuery,
  PlugfieldDataResult,
} from '../types/plugfield.types';
import { requestPlugfieldData } from '../utils/plugfield-data-request.util';
import { PlugfieldHttpService } from './plugfield-http.service';

/**
 * Proxy Plugfield `GET /data/daily`.
 */
@Injectable()
export class PlugfieldDataDailyService {
  constructor(private readonly plugfieldHttp: PlugfieldHttpService) {}

  async execute(
    query: PlugfieldDataQuery,
    incomingAuthorization?: string,
  ): Promise<PlugfieldDataResult> {
    return requestPlugfieldData(
      this.plugfieldHttp,
      '/data/daily',
      query,
      incomingAuthorization,
    );
  }
}
