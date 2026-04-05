import {
  BadGatewayException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import type { PlugfieldDeviceAssociateInput } from '../types/plugfield.types';
import { PlugfieldHttpService } from './plugfield-http.service';

/**
 * Proxy Plugfield `POST /device`.
 */
@Injectable()
export class PlugfieldDeviceAssociateService {
  constructor(private readonly plugfieldHttp: PlugfieldHttpService) {}

  async execute(
    input: PlugfieldDeviceAssociateInput,
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
    });

    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      throw new BadGatewayException(
        'Plugfield device associate returned an unexpected response shape',
      );
    }

    return raw as Record<string, unknown>;
  }
}
