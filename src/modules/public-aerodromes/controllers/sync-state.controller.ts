import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { SyncStateDocs } from '../docs/sync-state.docs';
import { PublicAerodromesSyncStateService } from '../services/public-aerodromes-sync-state.service';

@ApiTags('Public Aerodromes')
@Controller('public-aerodromes')
@UseGuards(AerobiApiKeyGuard)
export class SyncStateController {
  constructor(
    private readonly syncStateService: PublicAerodromesSyncStateService,
  ) {}

  @Get('sync-state')
  @SyncStateDocs()
  handle() {
    return this.syncStateService.execute();
  }
}
