import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { SyncController } from './controllers/sync.controller';
import { SyncStateController } from './controllers/sync-state.controller';
import { PrivateAerodromeRepository } from './repositories/private-aerodrome.repository';
import { PrivateAerodromesSyncStateRepository } from './repositories/private-aerodromes-sync-state.repository';
import { AnacPrivateAerodromesSourceService } from './services/anac-private-aerodromes-source.service';
import { PrivateAerodromesCsvParserService } from './services/private-aerodromes-csv-parser.service';
import { PrivateAerodromesSyncService } from './services/private-aerodromes-sync.service';
import { PrivateAerodromesSyncStateService } from './services/private-aerodromes-sync-state.service';

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
            'aerobi-api/1.0 (ANAC dados abertos Aerodromos Privados; +https://github.com/aerobi)',
        },
        maxRedirects: 5,
      }),
    }),
  ],
  controllers: [SyncController, SyncStateController],
  providers: [
    AerobiApiKeyGuard,
    AnacPrivateAerodromesSourceService,
    PrivateAerodromesCsvParserService,
    PrivateAerodromeRepository,
    PrivateAerodromesSyncStateRepository,
    PrivateAerodromesSyncStateService,
    PrivateAerodromesSyncService,
  ],
  exports: [PrivateAerodromesSyncService],
})
export class PrivateAerodromesModule {}
