import { Injectable } from '@nestjs/common';

import type {
  PlugfieldDataQuery,
  PlugfieldDataResult,
} from '../types/plugfield.types';
import { requestPlugfieldData } from '../utils/plugfield-data-request.util';
import { PlugfieldHttpService } from './plugfield-http.service';

/**
 * Proxy Plugfield `GET /data/sensor`.
 */
@Injectable()
export class PlugfieldDataSensorService {
  constructor(private readonly plugfieldHttp: PlugfieldHttpService) {}

  async execute(
    query: PlugfieldDataQuery,
    incomingAuthorization?: string,
  ): Promise<PlugfieldDataResult> {
    return requestPlugfieldData(
      this.plugfieldHttp,
      '/data/sensor',
      query,
      incomingAuthorization,
    );
  }
}
