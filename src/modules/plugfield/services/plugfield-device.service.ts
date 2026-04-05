import {
  BadGatewayException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import { normalizePlugfieldDeviceList } from '../utils/normalize-plugfield-device-list.util';
import { PlugfieldHttpService } from './plugfield-http.service';

export type PlugfieldDeviceListQuery = {
  readonly deviceId?: string;
  readonly code?: string;
};

export type PlugfieldDeviceAssociateInput = {
  readonly deviceId?: string;
  readonly code?: string;
};

/**
 * Proxies Plugfield device endpoints.
 */
@Injectable()
export class PlugfieldDeviceService {
  constructor(private readonly plugfieldHttp: PlugfieldHttpService) {}

  async listDevices(
    query: PlugfieldDeviceListQuery,
    incomingAuthorization?: string,
  ): Promise<Record<string, unknown>[]> {
    const raw = await this.plugfieldHttp.requestJson({
      method: 'GET',
      path: '/device',
      query: {
        deviceId: query.deviceId,
        code: query.code,
      },
      useVendorAuthorization: true,
      incomingAuthorization,
    });

    const items = normalizePlugfieldDeviceList(raw);
    return items as Record<string, unknown>[];
  }

  async associateDevice(
    input: PlugfieldDeviceAssociateInput,
    incomingAuthorization?: string,
  ): Promise<Record<string, unknown>> {
    const d = input.deviceId?.trim() ?? '';
    const c = input.code?.trim() ?? '';
    if (d.length === 0 && c.length === 0) {
      throw new BadRequestException('Informe deviceId ou code');
    }

    const body = d.length > 0 ? { deviceId: d } : { code: c };

    const raw = await this.plugfieldHttp.requestJson({
      method: 'POST',
      path: '/device',
      body,
      useVendorAuthorization: true,
      incomingAuthorization,
    });

    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      throw new BadGatewayException(
        'Plugfield device associate returned an unexpected response shape',
      );
    }

    return raw as Record<string, unknown>;
  }

  async getDeviceById(
    deviceId: string,
    incomingAuthorization?: string,
  ): Promise<Record<string, unknown>> {
    const encoded = encodeURIComponent(deviceId);
    const raw = await this.plugfieldHttp.requestJson({
      method: 'GET',
      path: `/device/${encoded}`,
      useVendorAuthorization: true,
      incomingAuthorization,
    });

    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      throw new BadGatewayException(
        'Plugfield device by id returned an unexpected response shape',
      );
    }

    return raw as Record<string, unknown>;
  }
}
