import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { SyncStateDocs } from '../docs/sync-state.docs';
import { RabSyncStateService } from '../services/rab-sync-state.service';

@ApiTags('RAB')
@Controller('rab')
export class SyncStateController {
  constructor(private readonly syncStateService: RabSyncStateService) {}

  @Get('sync-state')
  @SyncStateDocs()
  handle() {
    return this.syncStateService.execute();
  }
}
