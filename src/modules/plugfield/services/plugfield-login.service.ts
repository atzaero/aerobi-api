import { BadGatewayException, Injectable } from '@nestjs/common';

import { PlugfieldHttpService } from './plugfield-http.service';

export type PlugfieldLoginInput = {
  readonly username: string;
  readonly password: string;
};

/**
 * Proxies Plugfield `POST /login` (no Authorization header to vendor).
 */
@Injectable()
export class PlugfieldLoginService {
  constructor(private readonly plugfieldHttp: PlugfieldHttpService) {}

  async execute(input: PlugfieldLoginInput): Promise<Record<string, unknown>> {
    const raw = await this.plugfieldHttp.requestJson({
      method: 'POST',
      path: '/login',
      body: {
        username: input.username,
        password: input.password,
      },
      useVendorAuthorization: false,
    });

    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      throw new BadGatewayException(
        'Plugfield login returned an unexpected response shape',
      );
    }

    return raw as Record<string, unknown>;
  }
}
