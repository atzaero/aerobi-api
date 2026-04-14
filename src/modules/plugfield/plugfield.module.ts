import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { PlugfieldDataDailyController } from './controllers/plugfield-data-daily.controller';
import { PlugfieldDataHourlyController } from './controllers/plugfield-data-hourly.controller';
import { PlugfieldDataSensorController } from './controllers/plugfield-data-sensor.controller';
import { PlugfieldDeviceAssociateController } from './controllers/plugfield-device-associate.controller';
import { PlugfieldDeviceByIdController } from './controllers/plugfield-device-by-id.controller';
import { PlugfieldDeviceListController } from './controllers/plugfield-device-list.controller';
import { PlugfieldDataDailyService } from './services/plugfield-data-daily.service';
import { PlugfieldDataHourlyService } from './services/plugfield-data-hourly.service';
import { PlugfieldDataSensorService } from './services/plugfield-data-sensor.service';
import { PlugfieldDeviceAssociateService } from './services/plugfield-device-associate.service';
import { PlugfieldDeviceByIdService } from './services/plugfield-device-by-id.service';
import { PlugfieldDeviceListService } from './services/plugfield-device-list.service';
import { PlugfieldHttpService } from './services/plugfield-http.service';

/**
 * Proxy para a API Plugfield (`PLUGFIELD_API_BASE_URL`, default `https://prod-api.plugfield.com.br`).
 *
 * **Cliente → Aerobi:** `X-API-Key` = `AEROBI_API_KEY` (ver `AerobiApiKeyGuard`; bypass em `development` salvo `AEROBI_REQUIRE_AUTH`).
 *
 * **Aerobi → Plugfield (servidor):**
 * - `PLUGFIELD_API_KEY` — header `x-api-key`.
 * - `PLUGFIELD_TOKEN` — header `Authorization` (raw token, sem prefixo `Bearer`).
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
    PlugfieldDeviceListController,
    PlugfieldDeviceAssociateController,
    PlugfieldDeviceByIdController,
    PlugfieldDataDailyController,
    PlugfieldDataHourlyController,
    PlugfieldDataSensorController,
  ],
  providers: [
    AerobiApiKeyGuard,
    PlugfieldHttpService,
    PlugfieldDeviceListService,
    PlugfieldDeviceAssociateService,
    PlugfieldDeviceByIdService,
    PlugfieldDataDailyService,
    PlugfieldDataHourlyService,
    PlugfieldDataSensorService,
  ],
})
export class PlugfieldModule {}
