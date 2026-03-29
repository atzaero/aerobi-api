import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { FirebaseOrApiKeyGuard } from '@/common/guards/firebase-or-api-key.guard';

import { SyncDocs } from '../docs/sync.docs';
import { SyncRabDto } from '../dtos/sync-rab.dto';
import { RabSyncService } from '../services/rab-sync.service';

/**
 * `POST /rab/sync` usa {@link FirebaseOrApiKeyGuard}: em `NODE_ENV=development` o guard faz
 * bypass (sem headers); fora disso exige `X-API-Key` ou `Authorization: Bearer` (Firebase ID token).
 * Detalhes: JSDoc na classe do guard.
 */
@ApiTags('RAB')
@Controller('rab')
export class SyncController {
  constructor(private readonly rabSync: RabSyncService) {}

  @Post('sync')
  @UseGuards(FirebaseOrApiKeyGuard)
  @SyncDocs()
  handle(@Body() body: SyncRabDto = {}) {
    return this.rabSync.execute(body);
  }
}
