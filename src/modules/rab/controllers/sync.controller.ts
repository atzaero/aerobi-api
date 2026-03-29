import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RabApiKeyGuard } from '@/common/guards/rab-api-key.guard';

import { SyncDocs } from '../docs/sync.docs';
import { SyncRabDto } from '../dtos/sync-rab.dto';
import { RabSyncService } from '../services/rab-sync.service';

/**
 * `POST /rab/sync` — protegido por {@link RabApiKeyGuard} (ver JSDoc do guard).
 */
@ApiTags('RAB')
@Controller('rab')
@UseGuards(RabApiKeyGuard)
export class SyncController {
  constructor(private readonly rabSync: RabSyncService) {}

  @Post('sync')
  @SyncDocs()
  handle(@Body() body: SyncRabDto = {}) {
    return this.rabSync.execute(body);
  }
}
