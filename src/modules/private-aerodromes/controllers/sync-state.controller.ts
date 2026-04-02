import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { PrivateAerodromesApiKeyGuard } from '@/common/guards/private-aerodromes-api-key.guard';

import { SyncStateDocs } from '../docs/sync-state.docs';
import { PrivateAerodromesSyncStateService } from '../services/private-aerodromes-sync-state.service';

@ApiTags('Private Aerodromes')
@Controller('private-aerodromes')
@UseGuards(PrivateAerodromesApiKeyGuard)
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
