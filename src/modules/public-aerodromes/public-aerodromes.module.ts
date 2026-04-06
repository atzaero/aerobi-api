import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { PublicAerodromesLatestPeriodController } from './controllers/latest-period.controller';
import { PublicAerodromesRowsController } from './controllers/rows.controller';
import { SyncController } from './controllers/sync.controller';
import { SyncStateController } from './controllers/sync-state.controller';
import { PublicAerodromeRepository } from './repositories/public-aerodrome.repository';
import { PublicAerodromesSyncStateRepository } from './repositories/public-aerodromes-sync-state.repository';
import { AnacPublicAerodromesSourceService } from './services/anac-public-aerodromes-source.service';
import { PublicAerodromesCsvParserService } from './services/public-aerodromes-csv-parser.service';
import { PublicAerodromesLatestPeriodService } from './services/public-aerodromes-latest-period.service';
import { PublicAerodromesRowsService } from './services/public-aerodromes-rows.service';
import { PublicAerodromesSyncService } from './services/public-aerodromes-sync.service';
import { PublicAerodromesSyncStateService } from './services/public-aerodromes-sync-state.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        timeout: 180_000,
        maxContentLength: 60 * 1024 * 1024,
        maxBodyLength: 60 * 1024 * 1024,
        headers: {
          'User-Agent':
            config.get<string>('HTTP_USER_AGENT') ??
            'aerobi-api/1.0 (ANAC dados abertos Aerodromos Publicos; +https://github.com/aerobi)',
        },
        maxRedirects: 5,
      }),
    }),
  ],
  controllers: [
    SyncController,
    SyncStateController,
    PublicAerodromesRowsController,
    PublicAerodromesLatestPeriodController,
  ],
  providers: [
    AerobiApiKeyGuard,
    AnacPublicAerodromesSourceService,
    PublicAerodromesCsvParserService,
    PublicAerodromeRepository,
    PublicAerodromesSyncStateRepository,
    PublicAerodromesSyncStateService,
    PublicAerodromesSyncService,
    PublicAerodromesRowsService,
    PublicAerodromesLatestPeriodService,
  ],
  exports: [PublicAerodromesSyncService],
})
export class PublicAerodromesModule {}
