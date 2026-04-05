import { BadGatewayException, Injectable } from '@nestjs/common';

import { PlugfieldHttpService } from './plugfield-http.service';

/**
 * Proxy Plugfield `GET /device/{deviceId}`.
 */
@Injectable()
export class PlugfieldDeviceByIdService {
  constructor(private readonly plugfieldHttp: PlugfieldHttpService) {}

  async execute(
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
