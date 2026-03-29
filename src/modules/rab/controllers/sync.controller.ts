import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { SyncDocs } from '../docs/sync.docs';
import { SyncRabDto } from '../dtos/sync-rab.dto';
import { RabSyncService } from '../services/rab-sync.service';

@ApiTags('RAB')
@Controller('rab')
export class SyncController {
  constructor(private readonly rabSync: RabSyncService) {}

  @Post('sync')
  @SyncDocs()
  handle(@Body() body: SyncRabDto = {}) {
    return this.rabSync.execute(body);
  }
}
