import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { PlugfieldApiKeyGuard } from '@/common/guards/plugfield-api-key.guard';

import { PlugfieldDataController } from './controllers/plugfield-data.controller';
import { PlugfieldDeviceByIdController } from './controllers/plugfield-device-by-id.controller';
import { PlugfieldDeviceController } from './controllers/plugfield-device.controller';
import { PlugfieldLoginController } from './controllers/plugfield-login.controller';
import { PlugfieldDataService } from './services/plugfield-data.service';
import { PlugfieldDeviceService } from './services/plugfield-device.service';
import { PlugfieldHttpService } from './services/plugfield-http.service';
import { PlugfieldLoginService } from './services/plugfield-login.service';

/**
 * Proxy para a API Plugfield (`PLUGFIELD_API_BASE_URL`, default `https://prod-api.plugfield.com.br`).
 *
 * **Variáveis de ambiente**
 * - `PLUGFIELD_SYNC_API_KEY` — cliente → aerobi-api (`X-API-Key`); ver `PlugfieldApiKeyGuard`.
 * - `PLUGFIELD_SYNC_REQUIRE_AUTH` — força `X-API-Key` mesmo em `development` se truthy.
 * - `PLUGFIELD_VENDOR_API_KEY` — aerobi-api → Plugfield (`x-api-key`).
 * - `PLUGFIELD_VENDOR_AUTHORIZATION` — opcional; usado se o cliente não enviar `Authorization`.
 * - `PLUGFIELD_HTTP_TIMEOUT_MS` — timeout HTTP (default `8000`).
 * - `PLUGFIELD_API_BASE_URL` — base URL da Plugfield.
 */
@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const raw = config.get<string | number>(
          'PLUGFIELD_HTTP_TIMEOUT_MS',
          8000,
        );
        const parsed =
          typeof raw === 'number' ? raw : parseInt(String(raw), 10);
        const timeoutMs = Number.isFinite(parsed) && parsed > 0 ? parsed : 8000;
        return {
          timeout: timeoutMs,
          maxRedirects: 5,
          headers: {
            'Content-Type': 'application/json',
          },
          maxContentLength: 50 * 1024 * 1024,
          maxBodyLength: 50 * 1024 * 1024,
        };
      },
    }),
  ],
  controllers: [
    PlugfieldLoginController,
    PlugfieldDeviceController,
    PlugfieldDeviceByIdController,
    PlugfieldDataController,
  ],
  providers: [
    PlugfieldApiKeyGuard,
    PlugfieldHttpService,
    PlugfieldLoginService,
    PlugfieldDeviceService,
    PlugfieldDataService,
  ],
})
export class PlugfieldModule {}
