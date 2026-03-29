import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { RabApiKeyGuard } from '@/common/guards/rab-api-key.guard';

import { LatestPeriodController } from './controllers/latest-period.controller';
import { RowsController } from './controllers/rows.controller';
import { SyncController } from './controllers/sync.controller';
import { SyncStateController } from './controllers/sync-state.controller';
import { RabRowRepository } from './repositories/rab-row.repository';
import { RabSyncStateRepository } from './repositories/rab-sync-state.repository';
import { AnacIndexService } from './services/anac-index.service';
import { RabCsvParserService } from './services/rab-csv-parser.service';
import { RabRowsService } from './services/rab-rows.service';
import { RabSyncService } from './services/rab-sync.service';
import { RabSyncStateService } from './services/rab-sync-state.service';

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
            'aerobi-api/1.0 (ANAC dados abertos RAB; +https://github.com/aerobi)',
        },
        maxRedirects: 5,
      }),
    }),
  ],
  controllers: [
    LatestPeriodController,
    SyncStateController,
    RowsController,
    SyncController,
  ],
  providers: [
    RabApiKeyGuard,
    AnacIndexService,
    RabCsvParserService,
    RabRowRepository,
    RabSyncStateRepository,
    RabSyncStateService,
    RabRowsService,
    RabSyncService,
  ],
  exports: [RabSyncService, AnacIndexService],
})
export class RabModule {}
