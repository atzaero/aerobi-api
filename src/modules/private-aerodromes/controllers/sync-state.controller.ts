import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { SyncStateDocs } from '../docs/sync-state.docs';
import { PrivateAerodromesSyncStateService } from '../services/private-aerodromes-sync-state.service';

@ApiTags('Private Aerodromes')
@Controller('private-aerodromes')
@UseGuards(AerobiApiKeyGuard)
export class SyncStateController {
  constructor(
    private readonly syncStateService: PrivateAerodromesSyncStateService,
  ) {}

  @Get('sync-state')
  @SyncStateDocs()
  handle() {
    return this.syncStateService.execute();
  }
}
