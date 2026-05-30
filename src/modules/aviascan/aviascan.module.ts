import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { AviascanReadingsController } from './controllers/aviascan-readings.controller';
import { AviascanHttpService } from './services/aviascan-http.service';
import { AviascanReadingsService } from './services/aviascan-readings.service';

/**
 * Proxy para a API AviaScan (`AVIASCAN_API_BASE_URL`, default `https://aviascanapi.lmpierin.com.br`).
 *
 * **Cliente → Aerobi:** `X-API-Key` = `AEROBI_API_KEY` (ver `AerobiApiKeyGuard`; bypass em `development` salvo `AEROBI_REQUIRE_AUTH`).
 *
 * **Aerobi → AviaScan (servidor):**
 * - `AVIASCAN_API_BASE_URL` — base URL da AviaScan.
 * - `AVIASCAN_HTTP_TIMEOUT_MS` — timeout HTTP (default `8000`).
 */
@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const raw = config.get<string | number>(
          'AVIASCAN_HTTP_TIMEOUT_MS',
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
  controllers: [AviascanReadingsController],
  providers: [AerobiApiKeyGuard, AviascanHttpService, AviascanReadingsService],
})
export class AviascanModule {}
