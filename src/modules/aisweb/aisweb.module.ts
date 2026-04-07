import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { AiswebInfotempController } from './controllers/aisweb-infotemp.controller';
import { AiswebNotamController } from './controllers/aisweb-notam.controller';
import { AiswebRotaerController } from './controllers/aisweb-rotaer.controller';
import { AiswebSolController } from './controllers/aisweb-sol.controller';
import { AiswebHttpService } from './services/aisweb-http.service';
import { AiswebInfotempService } from './services/aisweb-infotemp.service';
import { AiswebNotamService } from './services/aisweb-notam.service';
import { AiswebRotaerService } from './services/aisweb-rotaer.service';
import { AiswebSolService } from './services/aisweb-sol.service';

/**
 * Proxy para a API AISWEB (DECEA) — infotemp, notam, rotaer, sol.
 *
 * **Cliente → Aerobi:** `X-API-Key` = `AEROBI_API_KEY` (ver `AerobiApiKeyGuard`).
 *
 * **Aerobi → AISWEB (servidor):**
 * - `AISWEB_API_KEY` — credencial da API AISWEB.
 * - `AISWEB_API_PASS` — senha da API AISWEB.
 * - `AISWEB_HTTP_TIMEOUT_MS` — timeout HTTP (default `8000`).
 *
 * Fallback automático entre `aisweb.decea.mil.br` e `aisweb.decea.gov.br`.
 */
@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const raw = config.get<string | number>('AISWEB_HTTP_TIMEOUT_MS', 8000);
        const parsed =
          typeof raw === 'number' ? raw : parseInt(String(raw), 10);
        const timeoutMs = Number.isFinite(parsed) && parsed > 0 ? parsed : 8000;
        return {
          timeout: timeoutMs,
          maxRedirects: 5,
          maxContentLength: 10 * 1024 * 1024,
        };
      },
    }),
  ],
  controllers: [
    AiswebInfotempController,
    AiswebNotamController,
    AiswebRotaerController,
    AiswebSolController,
  ],
  providers: [
    AerobiApiKeyGuard,
    AiswebHttpService,
    AiswebInfotempService,
    AiswebNotamService,
    AiswebRotaerService,
    AiswebSolService,
  ],
})
export class AiswebModule {}
