import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RabApiKeyGuard } from '@/common/guards/rab-api-key.guard';

import { SyncStateDocs } from '../docs/sync-state.docs';
import { RabSyncStateService } from '../services/rab-sync-state.service';

@ApiTags('RAB')
@Controller('rab')
@UseGuards(RabApiKeyGuard)
export class SyncStateController {
  constructor(private readonly syncStateService: RabSyncStateService) {}

  @Get('sync-state')
  @SyncStateDocs()
  handle() {
    return this.syncStateService.execute();
  }
}
