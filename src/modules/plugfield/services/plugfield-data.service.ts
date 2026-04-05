import {
  BadGatewayException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import { PlugfieldHttpService } from './plugfield-http.service';

export type PlugfieldDataQuery = {
  readonly sensorId?: string;
  readonly deviceId?: string;
  readonly startTime?: number;
  readonly endTime?: number;
};

export type PlugfieldDataResult = Record<string, unknown> | unknown[];

function isDataShape(value: unknown): value is PlugfieldDataResult {
  if (value === null || value === undefined) {
    return false;
  }
  if (Array.isArray(value)) {
    return true;
  }
  return typeof value === 'object';
}

/**
 * Proxies Plugfield data endpoints (`/data/daily`, `/data/hourly`, `/data/sensor`).
 */
@Injectable()
export class PlugfieldDataService {
  constructor(private readonly plugfieldHttp: PlugfieldHttpService) {}

  async getDaily(
    query: PlugfieldDataQuery,
    incomingAuthorization?: string,
  ): Promise<PlugfieldDataResult> {
    return this.fetchData('/data/daily', query, incomingAuthorization);
  }

  async getHourly(
    query: PlugfieldDataQuery,
    incomingAuthorization?: string,
  ): Promise<PlugfieldDataResult> {
    return this.fetchData('/data/hourly', query, incomingAuthorization);
  }

  async getSensor(
    query: PlugfieldDataQuery,
    incomingAuthorization?: string,
  ): Promise<PlugfieldDataResult> {
    return this.fetchData('/data/sensor', query, incomingAuthorization);
  }

  private async fetchData(
    path: string,
    query: PlugfieldDataQuery,
    incomingAuthorization?: string,
  ): Promise<PlugfieldDataResult> {
    const s = query.sensorId?.trim() ?? '';
    const d = query.deviceId?.trim() ?? '';
    if (s.length === 0 && d.length === 0) {
      throw new BadRequestException('Informe sensorId ou deviceId');
    }

    const raw = await this.plugfieldHttp.requestJson({
      method: 'GET',
      path,
      query: {
        sensorId: s.length > 0 ? s : undefined,
        deviceId: d.length > 0 ? d : undefined,
        startTime: query.startTime,
        endTime: query.endTime,
      },
      useVendorAuthorization: true,
      incomingAuthorization,
    });

    if (!isDataShape(raw)) {
      throw new BadGatewayException(
        'Plugfield data endpoint returned an unexpected response shape',
      );
    }

    return raw;
  }
}
