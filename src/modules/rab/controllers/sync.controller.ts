import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { SyncDocs } from '../docs/sync.docs';
import { SyncRabDto } from '../dtos/sync-rab.dto';
import { RabSyncService } from '../services/rab-sync.service';

/**
 * `POST /rab/sync` — protegido por {@link AerobiApiKeyGuard} (ver JSDoc do guard).
 */
@ApiTags('RAB')
@Controller('rab')
@UseGuards(AerobiApiKeyGuard)
export class SyncController {
  constructor(private readonly rabSync: RabSyncService) {}

  @Post('sync')
  @SyncDocs()
  handle(@Body() body: SyncRabDto = {}) {
    return this.rabSync.execute(body);
  }
}
